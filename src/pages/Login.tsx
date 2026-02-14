import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Login VIC</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Password</Label><div className="relative"><Input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" className="absolute right-3 top-2.5" onClick={() => setShow((s) => !s)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
            <Button className="w-full" disabled={loading}>{loading ? 'Accessing...' : 'Login'}</Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">No account? <Link className="text-primary" to="/register">Register</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
