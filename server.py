#!/usr/bin/env python3
"""
Simple Flask development server for the map distance calculator.
Serves the HTML file and static assets on localhost:3000 with HTTPS support
"""

import os
import ssl
import subprocess
from pathlib import Path

import requests
from flask import Flask, jsonify, request, send_file, send_from_directory

app = Flask(__name__)

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


@app.route('/')
def index():
    """Serve the main HTML file"""
    return send_file(os.path.join(BASE_DIR, 'index.html'))


@app.route('/dist/<path:filename>')
def dist_files(filename):
    """Serve minified JS and CSS files"""
    return send_from_directory(os.path.join(BASE_DIR, 'dist'), filename)


@app.route('/src/<path:filename>')
def src_files(filename):
    """Serve source files (for development/debugging)"""
    return send_from_directory(os.path.join(BASE_DIR, 'src'), filename)


@app.route('/api/proxy/gsi-distance')
def proxy_gsi_distance():
    """Proxy for 国土地理院 distance calculation API to avoid Mixed Content issues"""
    try:
        # Get query parameters
        lat1 = request.args.get('latitude1')
        lon1 = request.args.get('longitude1')
        lat2 = request.args.get('latitude2')
        lon2 = request.args.get('longitude2')

        if not all([lat1, lon1, lat2, lon2]):
            return jsonify({'error': 'Missing required parameters'}), 400

        # Make request to 国土地理院 API
        gsi_url = "http://vldb.gsi.go.jp/sokuchi/surveycalc/surveycalc/bl2st_calc.pl"
        params = {
            'outputType': 'json',
            'ellipsoid': 'bessel',
            'latitude1': lat1,
            'longitude1': lon1,
            'latitude2': lat2,
            'longitude2': lon2
        }

        response = requests.get(gsi_url, params=params, timeout=10)
        response.raise_for_status()

        return jsonify(response.json())

    except requests.RequestException as e:
        return jsonify({'error': f'API request failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


def create_self_signed_cert():
    """Create a self-signed certificate for HTTPS development"""
    cert_dir = Path(BASE_DIR) / '.certs'
    cert_dir.mkdir(exist_ok=True)

    cert_file = cert_dir / 'cert.pem'
    key_file = cert_dir / 'key.pem'

    # Check if certificates already exist
    if cert_file.exists() and key_file.exists():
        print("🔒 Using existing SSL certificates")
        return str(cert_file), str(key_file)

    print("🔐 Creating self-signed SSL certificate...")

    # Create self-signed certificate using OpenSSL
    cmd = [
        'openssl', 'req', '-x509', '-newkey', 'rsa:4096',
        '-keyout', str(key_file), '-out', str(cert_file),
        '-days', '365', '-nodes', '-subj',
        '/C=JP/ST=Tokyo/L=Tokyo/O=Dev/OU=Dev/CN=localhost'
    ]

    try:
        subprocess.run(cmd, check=True, capture_output=True)
        print("✅ SSL certificate created successfully")
        return str(cert_file), str(key_file)
    except subprocess.CalledProcessError:
        print("❌ Failed to create SSL certificate. Falling back to HTTP.")
        return None, None
    except FileNotFoundError:
        print("⚠️  OpenSSL not found. Falling back to HTTP.")
        return None, None


if __name__ == '__main__':
    # Check if running via ngrok (environment variable or command line argument)
    import sys
    use_ngrok = '--ngrok' in sys.argv or os.environ.get('NGROK_MODE') == '1'

    if use_ngrok:
        # For ngrok, always use HTTP
        print("🚀 Starting HTTP development server (ngrok mode)...")
        print("📍 Server URL: http://localhost:3000")
        print("🌐 Will be accessible via ngrok tunnel")
        ssl_context = None
    else:
        # Try to create/use SSL certificates for local development
        cert_file, key_file = create_self_signed_cert()

        if cert_file and key_file:
            print("🚀 Starting HTTPS development server...")
            print("📍 Server URL: https://localhost:3000")
            print("🔒 SSL certificate: Self-signed (development only)")
            ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
            ssl_context.load_cert_chain(cert_file, key_file)
        else:
            print("🚀 Starting HTTP development server...")
            print("📍 Server URL: http://localhost:3000")
            ssl_context = None

    print("🗂️  Serving files from:", BASE_DIR)
    print("💡 Press Ctrl+C to stop the server\n")

    app.run(
        host='0.0.0.0',
        port=3000,
        debug=True,
        use_reloader=True,
        ssl_context=ssl_context
    )
