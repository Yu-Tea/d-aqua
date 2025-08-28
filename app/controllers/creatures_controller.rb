class CreaturesController < ApplicationController
  skip_before_action :require_login, only: [ :show ]

  def index
    @creatures = current_user.creatures.order(created_at: :desc).page(params[:page])
  end

  def new
    @creature = Creature.new
  end

  def show
    @creature = Creature.find_by_short_uuid(params[:id])

    # OGP画像の切り替え
    set_meta_tags(
      title: @creature.name,
      description: @creature.description,
      og: {
        title: @creature.name,
        description: @creature.description,
        image: @creature.ogp_image_url,
        url: creature_url(@creature),
        type: 'article'
      },
      twitter: {
        card: 'summary',
        title: @creature.name,
        description: @creature.description,
        image: @creature.ogp_image_url
      }
    )
  end

  def create
    @creature = current_user.creatures.build(creature_params)
    if @creature.save
      begin
      # OGP画像生成を試行
      @creature.generate_and_save_ogp_image
    rescue => e
      # 必要に応じてデフォルト画像を設定
      @creature.update_column(:ogp_image_url, default_ogp_image_url)
    end
      redirect_to creatures_path, success: t("defaults.flash_message.created", item: Creature.model_name.human)
    else
      flash.now[:danger] = t("defaults.flash_message.not_created", item: Creature.model_name.human)
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  @creature = current_user.creatures.find_by_short_uuid(params[:id])
  end

  def update
    @creature = current_user.creatures.find_by_short_uuid(params[:id])
    if @creature.update(creature_params)
      redirect_to creatures_path, success: t("defaults.flash_message.updated", item: Creature.model_name.human)
    else
      flash.now[:danger] = t("defaults.flash_message.not_updated", item: Creature.model_name.human)
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    creature = current_user.creatures.find_by_short_uuid(params[:id])
    creature.destroy!
    redirect_to creatures_path, success: t("defaults.flash_message.deleted", item: Creature.model_name.human), status: :see_other
  end

  private

  def creature_params
    params.require(:creature).permit(:name, :description, :movement, :size, :svg_data)
  end

  def default_ogp_image_url
    "https://res.cloudinary.com/dk1v9site/image/upload/v1756282764/generated_ogp/ogp_default.png"
  end
end
