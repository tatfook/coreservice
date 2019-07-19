
#!/bin/bash

mysql -h 10.28.18.62 -P 3306 -u root -ptf.123456 -e '
drop database if exists `keepwork-wxa-test`;
create database `keepwork-wxa-test`;
drop database if exists `lesson-wxa-test`;
create database `lesson-wxa-test`;
'

rm migrations/keepwork/*
rm migrations/lesson/*
rm keepwork/migrations/*
rm lesson/migrations/*

curl http://localhost:8081/api/v0/migrations/generateAll

cp migrations/keepwork/* keepwork/migrations/
cp migrations/lesson/* lesson/migrations/

cd keepwork 
NODE_ENV=test sequelize db:migrate

cd ../lesson
NODE_ENV=test sequelize db:migrate

