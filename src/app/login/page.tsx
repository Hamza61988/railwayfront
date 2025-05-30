'use client';
import { useState } from "react";
import { useRouter } from 'next/navigation';

type FieldName = 'name' | 'email' | 'age' | 'password';

interface Field {
  name: FieldName;
  placeholder: string;
  type: string;
}

export default function Login() {
  const router = useRouter();

  const content: Field[] = [
    { name: "name", placeholder: "Name", type: "text" },
    { name: "email", placeholder: "Email", type: "email" },
    { name: "age", placeholder: "Age", type: "number" },
    { name: "password", placeholder: "Password", type: "password" },
  ];

  const [formData, setFormData] = useState<Record<FieldName, string>>({
    name: '',
    email: '',
    age: '',
    password: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const res = await fetch('https://mongorailwaytry-production.up.railway.app/authenticate', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok && result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('name', formData.name);
        alert(result.message || 'Login successful');
        router.push('/Dashboard'); 
      } else {
        alert(result.message || 'Login failed');
      }
    } catch (error) {
      console.error("Error:", error);
      alert('Something went wrong');
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {content.map((field, index) => (
          <div key={index}>
            <input
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
