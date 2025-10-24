# Server

Fastify + TypeScript + Drizzle ORM 기반 서버

## Setup

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
```bash
cp .env.example .env
# .env 파일을 열어서 DATABASE_URL 등을 수정
```

3. 데이터베이스 마이그레이션:
```bash
npm run db:generate  # 스키마 변경사항을 마이그레이션 파일로 생성
npm run db:push      # 데이터베이스에 스키마 적용
```

## Development

개발 서버 실행:
```bash
npm run dev
```

## Scripts

- `npm run dev` - 개발 서버 실행 (hot reload)
- `npm run build` - 프로덕션 빌드
- `npm start` - 프로덕션 서버 실행
- `npm run db:generate` - Drizzle 마이그레이션 생성
- `npm run db:push` - 스키마를 데이터베이스에 푸시
- `npm run db:studio` - Drizzle Studio 실행 (DB GUI)

## Project Structure

```
server/
├── src/
│   ├── db/
│   │   ├── schema.ts      # Drizzle 스키마 정의
│   │   └── index.ts       # DB 연결
│   ├── routes/            # API 라우트
│   ├── middleware/        # 미들웨어
│   └── index.ts          # 서버 엔트리포인트
├── drizzle/              # 마이그레이션 파일
└── dist/                 # 빌드 결과물
```

## API Endpoints

- `GET /health` - 헬스 체크
- `GET /users` - 사용자 목록 조회 (예제)
