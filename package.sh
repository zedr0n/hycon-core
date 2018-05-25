platform=${1:?"requires an argument macos | linux | win" }
output_dir=bundle-$platform
build_time=$(date +"%Y%m%d_%I%M")
file_name=$build_time'_'$platform'.zip'
npm i
npm run clear
rm -rf build
tsc
echo "=============== npm  tsc init finish============="
if [ -e "./src/api/clientDist" ]
then    
    rm -rf ./src/api/clientDist
fi

npm run clear
npm run block:build
echo "==================UI build finish==============="
pkg . --target $platform -o hycon-$platform
mkdir $output_dir
if [ -e "wallet" ]
then
    rm -rf wallet
fi

./node_modules/.bin/ts-node src/util/genWallet.ts
if [ -e $output_dir ]
then
    rm -rf $output_dir
fi
mkdir $output_dir
cd $output_dir
cp -rf ../data . 
cp -rf ../mnemonic . 
cp -rf ../wallet . 
cp -f ../hycon-$platform . 
cp -f ../documents/* .

mkdir node_modules
for name in $(cat ../modulesToBePacked.txt)
do
    cp -rf ../node_modules/$name ./node_modules/
done

mkdir -p src/api 
cp -rf ../src/api/clientDist ./src/api/ 
cp -f ../launch.sh.command .
cd ..
zip -r $file_name $output_dir
cp $file_name ~/$file_name
