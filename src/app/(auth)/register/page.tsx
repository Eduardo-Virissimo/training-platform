'use client';
import { z } from 'zod';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useForm } from '@tanstack/react-form-nextjs';
import { RegisterInput, registerSchema } from '@/schemas/auth.schema';
import authIllustration from '@/assets/auth-illustration.png';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: registerSchema
        .extend({
          confirmPassword: z.string().nonempty('Confirme sua senha.'),
        })
        .superRefine(({ password, confirmPassword }, ctx) => {
          if (password !== confirmPassword) {
            return ctx.addIssue({
              path: ['confirmPassword'],
              code: 'custom',
              message: 'As senhas não coincidem.',
            });
          }
        }),
    },
    onSubmit: ({ value }) => {
      SubmitRegister(value);
    },
  });

  async function SubmitRegister({ name, email, password }: RegisterInput) {
    setError('');

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error.message || 'Erro ao criar conta.');
        return;
      }

      router.push('/login?registered=true');
    } catch {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full lg:flex gap-4 duration-150 ">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-card shadow-xl border border-border mx-auto">
        {/* Form Side */}
        <div className="flex w-full flex-col justify-center px-6 py-10 lg:w-1/2">
          <Card className="text-foreground ring-0">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-semibold">Criar nova conta</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-destructive/20 border border-destructive/50 text-destructive-foreground rounded p-2 mb-4">
                  {error}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
              >
                <FieldGroup>
                  <form.Field name="name">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Nome completo</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Seu nome"
                            aria-invalid={isInvalid}
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>
                  <form.Field name="email">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="seu@email.com"
                            aria-invalid={isInvalid}
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>
                  <form.Field name="password">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Senha</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="password"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="••••••••"
                            aria-invalid={isInvalid}
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>
                  <form.Field name="confirmPassword">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Confirmar senha</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="password"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="••••••••"
                            aria-invalid={isInvalid}
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      );
                    }}
                  </form.Field>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Criando conta...
                      </span>
                    ) : (
                      'Criar conta'
                    )}
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-gray-400 text-sm">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Entrar
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Image Side - hidden on mobile */}
        <div className="hidden lg:flex lg:w-1/2 h-full items-center justify-center p-4">
          <Image
            src={authIllustration.src}
            alt="Ilustração de colaboração"
            width={500}
            height={800}
            className="h-full w-full object-cover rounded-md"
          />
        </div>
      </div>
    </div>
  );
}
