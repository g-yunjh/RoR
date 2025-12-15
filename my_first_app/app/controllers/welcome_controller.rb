class WelcomeController < ApplicationController
  def submit
    @username = params[:username]
    @message = params[:message]

    # 폼 데이터 처리 로직 (데이터베이스 저장 등)
    render 'result' # 결과 페이지로 이동
  end
end
