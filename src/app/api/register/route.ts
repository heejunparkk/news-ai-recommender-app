import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password: userPassword } = body;

    // 필수 필드 검증
    if (!email || !userPassword) {
      return NextResponse.json(
        { error: '이메일과 비밀번호는 필수입니다.' },
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 409 }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        preferences: {},
        bookmarks: [],
        readHistory: [],
        updatedAt: new Date(),
      },
    });

    // 비밀번호 제외하고 사용자 정보 반환
    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      preferences: user.preferences,
      bookmarks: user.bookmarks,
      readHistory: user.readHistory,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json(
      { 
        message: '회원가입이 완료되었습니다.',
        user: userWithoutPassword
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('회원가입 오류:', error);
    return NextResponse.json(
      { error: '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
