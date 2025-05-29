'use client';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';

type FieldName = 'name' | 'email' | 'age' | 'password';

interface Field {
  name: FieldName;
  placeholder: string;
  type: string;
}

export default function Login() {
  const navigate = useNavigate();
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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/authenticate', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok && result.token) {
        localStorage.setItem('token', result.token);
        alert(result.message || 'Login successful');
        navigate('/dashboard');
      } else {
        alert(result.message || 'Login failed');
      }
    } catch (error) {
      console.error("Error sending request:", error);
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
