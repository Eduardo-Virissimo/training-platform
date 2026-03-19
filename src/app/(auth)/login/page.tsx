'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from '@tanstack/react-form-nextjs';
import { loginSchema } from '@/schemas/auth.schema';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import authIllustration from '@/assets/auth-illustration.png';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: ({ value }) => {
      SubmitLogin(value);
    },
  });

  async function SubmitLogin({ email, password }: { email: string; password: string }) {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        console.log(data.error);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full lg:flex gap-4">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-card shadow-xl border border-border mx-auto">
        {/* Form Side */}
        <div className="flex w-full flex-col justify-center px-6 py-10 lg:w-1/2">
          <Card className="ring-0 flex flex-col items-stretch">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-semibold">Acesse sua conta</CardTitle>
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
                  <form.Field name="email">
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              placeholder="seu@email.com"
                              aria-invalid={isInvalid}
                              className="pl-10"
                            />
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                          </div>
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
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id={field.name}
                              name={field.name}
                              type="password"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              placeholder="••••••••"
                              aria-invalid={isInvalid}
                              className="pl-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                          </div>
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
                        Entrando...
                      </span>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-gray-400 text-sm">
                Não tem uma conta?{' '}
                <Link href="/register" className="text-primary hover:underline">
                  Criar conta
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Image Side - hidden on mobile */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-4">
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
