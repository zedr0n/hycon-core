git reset --hard origin/master
git pull
npm i
npm run clear
rm -rf build
tsc

if [ -e "./src/api/clientDist" ]
then    
    rm -rf ./src/api/clientDist
fi

npm run clear
npm run block:build
pkg . --target macos -o hycon-macos
mkdir bundle
if [ -e "wallet" ]
then
    rm -rf wallet
fi


if [ ! -e "bundle/node_modules" ]; then
    cp -rf ./node_modules ./bundle 
fi

./node_modules/.bin/ts-node src/util/genWallet.ts
cd bundle
cp -rf ../data . 
cp -rf ../mnemonic . 
cp -rf ../wallet . 
cp -f ../hycon-macos . 

mkdir -p src/api 
cp -rf ../src/api/clientDist ./src/api/ 
cp -f ../launch.sh.command .
cd ..
zip -r bundle.zip bundle

