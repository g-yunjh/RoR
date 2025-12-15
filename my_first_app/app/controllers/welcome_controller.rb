class WelcomeController < ApplicationController
  def submit
    @user = User.new(name: params[:username], email: params[:email], age: params[:age])
    if @user.valid?
      @user.save # 데이터베이스에 저장
      redirect_to users_path # 성공 후 사용자 목록 페이지로 이동
    else
      render 'new' # 유효성 검사 실패 시 폼을 다시 보여주기
    end
  end
end
