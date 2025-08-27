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

  private

  def svg_data_size_limit
    return unless svg_data.present?
    
    # JSONとしてシリアライズした時のサイズをチェック
    json_size = svg_data.to_json.bytesize
    
    if json_size > SVG_DATA_MAX_SIZE
      errors.add(:svg_data, "イラストデータが大きすぎます（上限: #{SVG_DATA_MAX_SIZE / 1024}KB）")
    end
  end

end
