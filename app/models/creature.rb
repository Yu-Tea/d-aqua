class Creature < ApplicationRecord
  belongs_to :user
  
  validates :name, presence: true, length: { maximum: 15 }
  validates :description, length: { maximum: 200 }
  validates :movement, presence: true
  validates :size, presence: true

  # enumで定義（integer型）
  enum movement: { swim: 0, float: 1, rest: 2 }
  enum size: { small: 0, medium: 1, large: 2 }
  

  # uuidの短縮
  def short_uuid
    Base64.urlsafe_encode64([uuid.delete('-')].pack("H*")).tr('=', '')
  end

  # 短縮uuidから検索
  def self.find_by_short_uuid(short_uuid)
    decode_uuid = Base64.urlsafe_decode64(short_uuid).unpack1("H*").insert(8, '-').insert(13, '-').insert(18, '-').insert(23, '-')
    find_by(uuid: decode_uuid)
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
  
  # SVGを取得するメソッド
  def svg_content
    parsed_svg_data['svg']
  end
end
