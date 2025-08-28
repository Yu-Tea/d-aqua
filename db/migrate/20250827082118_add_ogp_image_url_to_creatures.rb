class AddOgpImageUrlToCreatures < ActiveRecord::Migration[7.2]
  def change
    add_column :creatures, :ogp_image_url, :string
    add_index :creatures, :ogp_image_url
  end
end
