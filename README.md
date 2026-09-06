# 🐠 DAYDREAM AQUARIUM 🐟️

![](https://github.com/user-attachments/assets/27bd8b57-72b9-4504-9c3a-117bc7039090)
DAYDREAM AQUARIUM は、アナタや誰かがソウゾウしたイキモノが住まう空想水族館です。

> **【お知らせ】**
> 
> 本アプリの公開およびサービス運用は終了いたしました。これまでご利用・ご閲覧いただき、誠にありがとうございました！

## 📖 サービス概要

DAYDREAM AQUARIUM は、ユーザーがイラストを描いて生き物を作成したり、発見してコレクションできるインタラクティブな Web アプリケーションです。
ユーザーが作成した生き物はアクアリウム画面内にランダムに発生し、クリックすることで情報を確認したり図鑑に登録することができます。

## 🎯 メインのターゲットユーザー

- 海洋生物に興味がある方
- コレクション要素のあるゲームが好きな方
- イラストを描くことが好きな方
- SNS でシェアを楽しみたい方

## 💡 機能紹介
<table  style="text-align: center;">
  <tr>
    <th align="center" width="50%">イキモノをソウゾウしよう</th>
    <th align="center" width="50%">アクアリウムを観察しよう</th>
  </tr>
  <tr>
  <!-- HTML使用時のテーブル背景色位置ズレの調整用 -->
  </tr>
  <tr>
    <td>
      <img src="https://github.com/user-attachments/assets/425b8d7e-8d4d-4627-a38a-f5c7ab622f56">
    </td>
    <td>
      <img src="https://github.com/user-attachments/assets/ac06cba4-d1eb-48f9-bf58-b5cfe32941ff">
    </td>
  </tr>
  <tr>
    <td>
      ユーザー登録してログインすると「ソウゾウ」ページからイキモノを作成できるようになります。大きさや泳ぎ方も設定できます。
    </td>
    <td>
      ユーザーが作成したイキモノ達はアクアリウム内に現れ、一定時間で消えていきます。どんなイキモノに出会えるでしょうか？
    </td>
  </tr>
</table>

<table  style="text-align: center;">
  <tr>
    <th align="center" width="50%">イキモノを発見しよう</th>
    <th align="center" width="50%">図鑑に登録しよう</th>
  </tr>
  <tr>
  <!-- HTML使用時のテーブル背景色位置ズレの調整用 -->
  </tr>
  <tr>
    <td>
      <img src="https://github.com/user-attachments/assets/40251058-1e07-4a39-87e9-87f5eef0cb69">
    </td>
    <td>
      <img src="https://github.com/user-attachments/assets/f9108e90-8cf3-4a30-8e5a-600236122dc8">
    </td>
  </tr>
  <tr>
    <td>
      イキモノをクリックすると、名前や説明文などの詳細が表示されます。ログイン済みユーザーが初めて見つけたイキモノには「NEW!!」マークが表示されます。
    </td>
    <td>
      ログイン済みユーザーには「図鑑」ページが解放されます。発見した生き物が登録され、いつでも確認できるようになるので、全種類制覇を目指してみましょう。
    </td>
  </tr>
</table>
  
  
**⚓️ユーザー登録していない方でも、下記の機能はご利用できます**
- アクアリウム内に現れるイキモノを眺める
- イキモノをクリックして詳細を確認したり、「Xに投稿」ボタンでの共有

## 🛠 使用技術

| カテゴリ           | 技術                                      |
| ------------------ | ----------------------------------------- |
| フロントエンド     | Tailwind CSS／Hotwire（Turbo / Stimulus） |
| バックエンド       | Rails 7.2.2／Ruby 3.3.6                   |
| データベース       | PostgreSQL                                |
| インフラ・デプロイ | Docker／Render／Neon                        |
| 外部サービス       | Cloudinary                                |
