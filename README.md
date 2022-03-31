# Chinese Personal Financial Management Tool

I will build a simple website that aggregates your WeChat Pay, Alipay and your Chinese bank transactions so you can better understand your spending patterns.

## Infrastructure

This application is built on a NodeJS server, deployed on an EC2 instance on AWS.
The server has nginx directing the requests
The front-end and backend will both be deployed through this repository.

## Next steps

- Setup simple front-end webpage to upload transactions CSVs and merge across platforms
- Develop backend logic for wrangling raw CSV transaction downloads
- Clean uploaded CSVs for upload into #LunchMoney.app
- Won’t buy domain name just yet - will use out-of-box AWS domain

## Parsing Logic

- TODO: Where Alipay / WeChat Pay transactions appear on the bank statement, replace details on the bank transactions with more granular data from Alipay / WeChat Pay

### China Construction Bank

- Renames certain headers into English
- Combines "支出" and "收入" columns into a single column
- TODO: Remove "支付宝" and "财付通" from payee and notes columns, and add them as a tag
- TODO: Fill in missing "payee" entries with something relevant

## Later steps

- Build database to store your data
- Build simple front-end table and graphs to show your transactions