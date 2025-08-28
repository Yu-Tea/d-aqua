require 'tempfile'

class Creature < ApplicationRecord
  belongs_to :user

  validates :name, presence: true, length: { maximum: 10 }
  validates :description, presence: true, length: { maximum: 200 }
  validates :movement, presence: true
  validates :size, presence: true

  # SVGデータのサイズ制限（例：100KB）
  SVG_DATA_MAX_SIZE = 100.kilobytes
  validates :svg_data, presence: true
  validate :svg_data_size_limit

  # enumで定義（integer型）
  enum :movement, { swim: 0, float: 1, rest: 2 }
  enum :size, { small: 0, medium: 1, large: 2 }

  has_many :books, dependent: :destroy
  has_many :discoverers, through: :books, source: :user

  # トップページ用のランダム取得メソッド
  scope :random_by_movement, ->(movement_type) { where(movement: movement_type).order("RANDOM()").limit(1) }

  # uuidの短縮
  def short_uuid
    Base64.urlsafe_encode64([ id.delete("-") ].pack("H*")).tr("=", "")
  end

  # 短縮uuidから検索
  def self.find_by_short_uuid(short_uuid)
    decode_uuid = Base64.urlsafe_decode64(short_uuid).unpack1("H*").insert(8, "-").insert(13, "-").insert(18, "-").insert(23, "-")
    find_by(id: decode_uuid)
  end

  def to_param
    short_uuid
  end

  # SVGデータを取得するメソッド
  def parsed_svg_data
    return {} unless svg_data.present?

    case svg_data
      when String
        JSON.parse(svg_data)
      when Hash
        svg_data
      else
        {}
    end
  rescue JSON::ParserError
    {}
  end

  def svg_content
    parsed_svg_data["svg"]
  end

  # OGP作成
  #def ogp_image_url
    # 既にOGP画像が生成済みの場合はそのURLを返す
   # return self[:ogp_image_url] if self[:ogp_image_url].present?
    # 
    # 初回のみOGP画像を生成してURLを保存
    # generated_url = generate_ogp_image
    # update_column(:ogp_image_url, generated_url)
    # generated_url
  # end

  # OGP画像を生成して保存（明示的に呼び出し）
  def generate_and_save_ogp_image
    return if self[:ogp_image_url].present? # 既に生成済みなら何もしない
    
    generated_url = generate_ogp_image
    update_column(:ogp_image_url, generated_url)
    generated_url
  end
  
  private

  # OGP画像作成
  def generate_ogp_image
    begin
    # SVGを390pxサイズでPNGに変換
    svg_content = self.svg_content
    svg_handle = RSVG::Handle.new_from_data(svg_content)
    original_dimensions = svg_handle.dimensions
    
    # 390pxに拡大する比率を計算
    svg_size = 390
    scale_x = svg_size.to_f / original_dimensions.width
    scale_y = svg_size.to_f / original_dimensions.height
    
    # 390x390pxでCairo Surfaceを作成
    surface = Cairo::ImageSurface.new(Cairo::FORMAT_ARGB32, svg_size, svg_size)
    context = Cairo::Context.new(surface)
    
    # 透明背景設定
    context.set_operator(Cairo::OPERATOR_CLEAR)
    context.paint
    context.set_operator(Cairo::OPERATOR_OVER)
    
    # 390pxサイズでSVG描画
    context.scale(scale_x, scale_y)
    svg_handle.render_cairo(context)
    
    # 一時ファイルでクリーチャー画像を作成
    Tempfile.create(['creature_390px', '.png']) do |creature_temp|
      surface.write_to_png(creature_temp.path)
      
      # 背景画像と合成
      background_url = "https://res.cloudinary.com/dk1v9site/image/upload/v1756279471/ogp_templates/creature_ogp_background.png"
      background_image = MiniMagick::Image.open(background_url)
      creature_image = MiniMagick::Image.open(creature_temp.path)
      
      result = background_image.composite(creature_image) do |c|
        c.compose "Over"
        c.gravity "center"
      end
      result.flatten
      
      # 最終結果を一時ファイルで作成
      Tempfile.create(['ogp_final', '.png']) do |final_temp|
        result.write(final_temp.path)
        
        # Cloudinaryにアップロード
        upload_result = Cloudinary::Uploader.upload(
          final_temp.path,
          public_id: "ogp_images/creature_#{self.id}",
          overwrite: true,
          resource_type: "image"
        )
        
        return upload_result['secure_url']
      end
    end
    
    rescue => e
      Rails.logger.error "OGP画像生成エラー: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      return nil
    end
  end

  def default_ogp_image_url
    # デフォルトのOGP画像URL
    "https://res.cloudinary.com/dk1v9site/image/upload/v1756282764/generated_ogp/ogp_default.png"
  end

  # SVGイラストをDBに保存時のサイズチェック
  def svg_data_size_limit
    return unless svg_data.present?
    
    # JSONとしてシリアライズした時のサイズをチェック
    json_size = svg_data.to_json.bytesize
    
    if json_size > SVG_DATA_MAX_SIZE
      errors.add(:svg_data, "イラストデータが大きすぎます（上限: #{SVG_DATA_MAX_SIZE / 1024}KB）")
    end
  end
end
