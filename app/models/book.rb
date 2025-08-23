class Book < ApplicationRecord
  belongs_to :user
  belongs_to :creature

  validates :user_id, uniqueness: { scope: :creature_id }
end
