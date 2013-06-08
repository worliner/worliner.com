worliner.com
============
gitからクローン後 "sudo npm install"　で必要なライブラリが揃います
追加した場合はpackage.jsonに追記

以下のコマンドでlibicuを主導でインストールする必要あり
cd $(brew --prefix) && git pull --rebase
git checkout 5ddd40b $(brew --prefix)/Library/Formula/icu4c.rb
brew install icu4c