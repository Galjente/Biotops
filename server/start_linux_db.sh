docker rm -f biotops
mkdir -p -m 777 ~/biotops/mysql/data
docker run --name biotops -v ~/biotops/mysql/data -p 3306:3306 -e MYSQL_ROOT_PASSWORD=biotops_test_password \
 -e MYSQL_USER=biotops -e MYSQL_PASSWORD=biotops_test_password -e MYSQL_DATABASE=biotops -d mysql/mysql-server:5.6