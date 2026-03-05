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

  error(message: string) {
    return NextResponse.json(
      {
        error: { message },
        timestamp: new Date().toISOString(),
        statusCode: 400,
      },
      { status: 400 }
    );
  },

  notFound(message: string) {
    return NextResponse.json(
      {
        error: { message },
        timestamp: new Date().toISOString(),
        statusCode: 404,
      },
      { status: 404 }
    );
  },

  unauthorized(message: string) {
    return NextResponse.json(
      {
        error: { message },
        timestamp: new Date().toISOString(),
        statusCode: 401,
      },
      { status: 401 }
    );
  },

  forbidden(message: string) {
    return NextResponse.json(
      {
        error: { message },
        timestamp: new Date().toISOString(),
        statusCode: 403,
      },
      { status: 403 }
    );
  },

  internalError(message: string) {
    return NextResponse.json(
      {
        error: { message },
        timestamp: new Date().toISOString(),
        statusCode: 500,
      },
      { status: 500 }
    );
  },

  conflictError(message: string) {
    return NextResponse.json(
      {
        error: { message },
        timestamp: new Date().toISOString(),
        statusCode: 409,
      },
      { status: 409 }
    );
  },
};
