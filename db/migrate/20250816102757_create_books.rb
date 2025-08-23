class CreateBooks < ActiveRecord::Migration[7.2]
  def change
    create_table :books do |t|
      t.references :user, foreign_key: true
      t.references :creature, type: :uuid, foreign_key: true

      t.timestamps
    end
    add_index :books, [ :user_id, :creature_id ], unique: true
  end
end
