class CreaturesController < ApplicationController
  skip_before_action :require_login, only: [:show]

  def index
    @creatures = current_user.creatures.order(created_at: :desc)
  end

  def new
    @creature = Creature.new
  end

  def show
    @creature = Creature.find_by_short_uuid(params[:id])
  end

  def create
    @creature = current_user.creatures.build(creature_params)
    if @creature.save
      redirect_to creatures_path, success: t('defaults.flash_message.created', item: Creature.model_name.human)
    else
      flash.now[:danger] = t('defaults.flash_message.not_created', item: Creature.model_name.human)
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    creature = current_user.creatures.find_by_short_uuid(params[:id])
    creature.destroy!
    redirect_to creatures_path, success: t('defaults.flash_message.deleted', item: Creature.model_name.human), status: :see_other
  end

  private

  def creature_params
    params.require(:creature).permit(:name, :description, :movement, :size, :svg_data)
  end
end
