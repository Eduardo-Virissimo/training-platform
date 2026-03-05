import { forbidden } from 'next/navigation';
import { NextResponse } from 'next/server';

export const response = {
  ok(data: unknown, status = 200) {
    return NextResponse.json({ msg: 'Object retrieved successfully', data }, { status });
  },
  created(data: unknown, status = 201) {
    return NextResponse.json({ msg: 'Object created successfully', data }, { status: 201 });
  },

  error(message: string, status = 400) {
    return NextResponse.json(
      {
        msg: 'An error occurred',
        error: { message },
        timestamp: new Date().toISOString(),
        statusCode: status,
      },
      { status }
    );
  },

  notFound(message: string, status = 404) {
    return NextResponse.json(
      {
        msg: 'Object not found',
        error: { message },
        timestamp: new Date().toISOString(),
        statusCode: status,
      },
      { status }
    );
  },

  unauthorized(message: string, status = 401) {
    return NextResponse.json(
      {
        msg: 'Unauthorized',
        error: { message },
        timestamp: new Date().toISOString(),
        statusCode: status,
      },
      { status }
    );
  },

  forbidden(message: string, status = 403) {
    return NextResponse.json(
      {
        msg: 'Forbidden',
        error: { message },
        timestamp: new Date().toISOString(),
        statusCode: status,
      },
      { status }
    );
  },

  internalError(message: string, status = 500) {
    return NextResponse.json(
      {
        msg: 'Internal Server Error',
        error: { message },
        timestamp: new Date().toISOString(),
        statusCode: status,
      },
      { status }
    );
  },
};
