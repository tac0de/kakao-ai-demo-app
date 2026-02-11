# Kakao AI Demo App

강의 소개/미리보기용 데모 웹 앱입니다.

## 목적
- 수강생이 챗봇 동작을 브라우저에서 바로 체험
- `/체험시작`, `/앱전환`, `/내아이디` 같은 명령 흐름 시연
- Kakao payload 형태를 서버에서 대신 구성해 webhook으로 전달

## 실행
```bash
cd demo-app
npm install
cp .env.example .env
```

`.env`에서 `TARGET_WEBHOOK_URL`을 실제 함수 URL로 수정 후:
```bash
npm run dev
```

브라우저:
- `http://localhost:8787`

## Railway 배포 (추천)
1. Railway 로그인
```bash
railway login
```
2. 프로젝트 생성/연결
```bash
railway init
```
3. 환경변수 설정
- `TARGET_WEBHOOK_URL`: Firebase Functions `kakaobot` URL
- `DEMO_DEFAULT_ACCOUNT_ID`: 예) `demo-user-001`

4. 배포
```bash
railway up
```

5. 배포 URL 확인
```bash
railway domain
```

참고:
- `railway.json`에 헬스체크(`/health`)와 시작 명령이 포함되어 있음

## 포함 기능
- 계정/채널 타입 설정 (`dm`/`group`)
- 빠른 명령 버튼 (`/체험시작`, `/앱전환 default`, `/앱전환 preview`, `/내아이디`)
- 채팅 메시지 + raw JSON 확인
- 설정값 localStorage 저장

## 주의
- 운영자 명령은 데모에서 기본 비활성 흐름으로 안내됨
- 이 앱은 홍보/미리보기용이며 완제품 운영 콘솔이 아님
