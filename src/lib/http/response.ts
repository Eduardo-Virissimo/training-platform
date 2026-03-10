import { NextResponse } from 'next/server';

export const response = {
  ok(data: unknown) {
    return NextResponse.json({ msg: 'OK', data }, { status: 200 });
  },
  created(data: unknown) {
    return NextResponse.json({ msg: 'Created', data }, { status: 201 });
  },
  noContent() {
    return new NextResponse(null, { status: 204 });
  },

  error(message: string, status = 400, issues: unknown = undefined) {
    return NextResponse.json(
      {
        error: { message, issues },
        timestamp: new Date().toISOString(),
        statusCode: status,
      },
      { status: status }
    );
  },
};
