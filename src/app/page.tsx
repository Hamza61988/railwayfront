'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type FieldName = 'name' | 'email' | 'age' | 'password';

interface Field {
  name: FieldName;
  placeholder: string;
  type: string;
}

export default function Register() {
  const router = useRouter();
  const content: Field[] = [
    { name: 'name', placeholder: 'Name', type: 'text' },
    { name: 'email', placeholder: 'Email', type: 'email' },
    { name: 'age', placeholder: 'Age', type: 'number' },
    { name: 'password', placeholder: 'Password', type: 'password' },
  ];

  const [formData, setFormData] = useState<Record<FieldName, string>>({
    name: '',
    email: '',
    age: '',
    password: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('https://mongorailwaytry-production.up.railway.app/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        router.push('/login');
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Register</h2>
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
