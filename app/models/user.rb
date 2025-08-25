class User < ApplicationRecord
  authenticates_with_sorcery!

  validates :password, length: { minimum: 3 }, if: -> { new_record? || changes[:crypted_password] }
  validates :password, confirmation: true, if: -> { new_record? || changes[:crypted_password] }
  validates :password_confirmation, presence: true, if: -> { new_record? || changes[:crypted_password] }
  validates :name, presence: true, length: { maximum: 255 }
  validates :email, presence: true, uniqueness: true
  validates :reset_password_token, uniqueness: true, allow_nil: true

  has_many :creatures, dependent: :destroy

  has_many :books, dependent: :destroy
  has_many :discovered_creatures, through: :books, source: :creature

  def own?(object)
    id == object&.user_id
  end

  # 生き物を発見するメソッド
  def discover(creature)
    # 既に発見済みかチェック
    return false if discovered?(creature)

    # 発見登録
    books.create!(creature: creature)
    true # 新発見の場合はtrue
  rescue ActiveRecord::RecordInvalid
    false # 重複などのエラーの場合はfalse
  end

  # 発見済みかチェック
  def discovered?(creature)
    books.exists?(creature: creature)
  end
end
