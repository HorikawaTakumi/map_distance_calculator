# WSL2 ポートフォワーディング自動設定

このスクリプトはWSL2環境で動作しているアプリケーションに同一WiFi内の他のデバイス（スマホなど）からアクセスできるよう、自動でポートフォワーディングとファイアウォールの設定を行います。

## 使用方法

### 1. スクリプトファイルをWindowsにコピー

WSLターミナルで以下のコマンドを実行：

```bash
# Windowsのデスクトップにコピーする例
cp setup-wsl-port.ps1 /mnt/c/Users/$USER/Desktop/
```

### 2. PowerShellを管理者権限で実行

1. **Windows + X** キーを押す
2. **「Windows PowerShell (管理者)」** を選択
3. デスクトップに移動：`cd Desktop`

### 3. スクリプトを実行

#### 基本的な使用方法：

```powershell
# ポート3000のフォワーディング設定（デフォルト）
.\setup-wsl-port.ps1

# カスタムポートの設定
.\setup-wsl-port.ps1 -Port 8080

# 現在のステータス確認
.\setup-wsl-port.ps1 -Status

# ポートフォワーディングの削除
.\setup-wsl-port.ps1 -Remove
```

## 実行順序

1. **PowerShellスクリプトを実行**（Windows側の設定）
2. **WSL2でアプリケーションを起動**

```bash
# WSLターミナルで
cd /home/horikawa/map_distance_calculator
npm run start
```

## アクセス方法

設定完了後、スマホのブラウザで以下のURLにアクセス：

- **HTTPS**: `https://[WindowsのIPアドレス]:3000`
- **HTTP**: `http://[WindowsのIPアドレス]:3000`

WindowsのIPアドレスはスクリプト実行時に表示されます。

## トラブルシューティング

### スクリプト実行エラー

```powershell
# 実行ポリシーエラーが出た場合
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### アクセスできない場合

1. **ステータス確認**：
   ```powershell
   .\setup-wsl-port.ps1 -Status
   ```

2. **WSLが起動しているか確認**：
   ```bash
   wsl --status
   ```

3. **ファイアウォール設定を手動確認**：
   - Windows Defender ファイアウォール → 詳細設定
   - 受信の規則で「WSL Port 3000」が有効になっているか確認

4. **ポートフォワーディング再設定**：
   ```powershell
   .\setup-wsl-port.ps1 -Remove
   .\setup-wsl-port.ps1
   ```

### よくある問題

- **WSL IPアドレスが取得できない**: WSLを再起動してください
- **管理者権限エラー**: PowerShellを必ず管理者として実行してください
- **スマホからアクセスできない**: スマホとPCが同じWiFiに接続されているか確認してください

## セキュリティ注意事項

- このスクリプトは開発環境用です
- 本番環境では適切なセキュリティ設定を行ってください
- 不要になったら `-Remove` オプションでポートフォワーディングを削除してください