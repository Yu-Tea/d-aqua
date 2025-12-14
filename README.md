# 🐠 DAYDREAM AQUARIUM 🐟️

![](https://github.com/user-attachments/assets/27bd8b57-72b9-4504-9c3a-117bc7039090)
DAYDREAM AQUARIUM は、アナタや誰かがソウゾウしたイキモノが住まう空想水族館です。

### 🌊[ご来館はこちらから](https://day-aqua.onrender.com)

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
      <img src="https://i.gyazo.com/9bd9c40a48e0e8c6db35121be53ea3b7.gif">
    </td>
    <td>
      <img src="https://i.gyazo.com/76ea997ec10f3d28f2a91d0dc33c8a47.gif">
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
      <img src="https://i.gyazo.com/8f8574526e1c3727057103284608548a.gif">
    </td>
    <td>
      <img src="https://i.gyazo.com/8aca8405f485d86416bc0e13e50fc7d6.gif">
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

※ユーザー登録していない方でも、下記の機能はご利用できます。
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