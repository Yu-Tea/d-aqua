class CreateCreatures < ActiveRecord::Migration[7.2]
  def change
    create_table :creatures, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.json :svg_data, null: false
      t.integer :movement, null: false, default: 0    # enum用
      t.integer :size, null: false, default: 1        # enum用（medium）

      t.timestamps
    end
  end
end
