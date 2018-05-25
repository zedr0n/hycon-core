# Caution
* 내부 테스트용이니, 외부에 공개되지 않게해주세요.

# OS
* Mac: ready
* Linux: ready
* Windows: being built

# Download
```
smb://192.168.100.100/public/hycon/macOS/20180524_dd71a66a6f79e0bec9d34ead4abb70a2.zip
```

# Install & Run
* 압축을 풉니다.
* 터미널을 엽니다.
* "run"을 실행합니다.

# How to use
* 브라우져에서 이렇게 오픈합니다
```
http://localhost:2442/
```

# Testnet  사용하기
* 아래처럼  networkid에 문자열로 입력됩니다.
```
./hycon --port=8248 --str_port=9081 --api --api_port=2442 --networkid=testnet
./hycon --port=8248 --str_port=9081 --api --api_port=2442 --networkid=vitaminc
```

# 테스트
* 다음은 테스트 항목입니다

## 지갑 추가
* 클릭하여, 지갑을 추가합니다.
* 언어를 선택합니다.
* 이름과 패스워드를 입력합니다
* 패스워드를 기억해주세요
* 니모닉을 적거나, 다른곳에 보관해주세요
* 지갑이 만들어지나요?

## 지갑 복원
* clear를 실행해서 지갑을 지웁니다
* rm -rf wallet
* 패스워드와 지갑이 중요합니다
* 지갑 복원을 누릅니다.
* 패스워드와 니모닉을 입력합니다
* 지갑이 복원되나요?

## 하이콘 보내기
* 테스트 지갑을 선택합니다(test로 시작하는 지갑,패스워드는 빈 문자열입니다)
* 하이콘을 본인의 지갑으로 보내주세요.
* 금액을 입력합니다 (예제)) 
* 10 hycon
* 0.000000001 hycon
* 1000.2 hycon
* 금액이 보내지나요?

## 하이콘 수신
* 하이콘을 다른 지갑에 보냅니다.
* 다른 사람 
* 나의 다른 지갑
* 위와 같이 보내면 됩니다.
* is hycon transferred?

## 프로그램 재설치
* 모든 프로그램을 지웁니다
* 압축을 풉니다
* 지갑을 복원합니다
* 금액이 안전하게 복원되었나요?

