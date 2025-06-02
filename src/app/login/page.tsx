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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {content.map((field, index) => (
            <div key={index}>
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name]}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
