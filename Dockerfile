# Node.js 20のLTS版を使用
FROM node:20-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production

# ソースコードをコピー
COPY src ./src

# 環境変数でポートを設定（必要に応じて）
ENV NODE_ENV=production

# Botを起動
CMD ["npm", "start"]
