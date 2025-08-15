import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormData {
  businessName: string;
  name: string;
  email: string;
  document: string;
  contactPhone: string;
}

interface CreateCustomerModalFormProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
}

export default function CreateCustomerModalForm({ formData, onFormDataChange }: CreateCustomerModalFormProps) {
  
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      // CPF: 000.000.000-00
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    // Se não começar com 55, adiciona o código do país
    let formattedNumbers = numbers;
    if (!numbers.startsWith('55') && numbers.length > 0) {
      formattedNumbers = '55' + numbers;
    }
    
    // Limita a 13 dígitos no máximo (55 + DDD + 9 dígitos)
    formattedNumbers = formattedNumbers.substring(0, 13);
    
    if (formattedNumbers.length <= 12) {
      // +55 (00) 0000-0000
      return formattedNumbers.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '+$1 ($2) $3-$4');
    } else {
      // +55 (00) 00000-0000
      return formattedNumbers.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4');
    }
  };

  const getCleanPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    // Se não começar com 55, adiciona o código do país
    if (!numbers.startsWith('55') && numbers.length > 0) {
      return '55' + numbers;
    }
    return numbers;
  };

  const sanitizeEmail = (value: string) => {
    return value.toLowerCase().trim().replace(/[^a-z0-9@._-]/g, '');
  };

  const sanitizeName = (value: string) => {
    return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim();
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    let sanitizedValue = value;

    switch (field) {
      case 'document':
        sanitizedValue = formatCNPJ(value);
        break;
      case 'contactPhone':
        sanitizedValue = formatPhone(value);
        break;
      case 'email':
        sanitizedValue = sanitizeEmail(value);
        break;
      case 'name':
      case 'businessName':
        sanitizedValue = sanitizeName(value);
        break;
    }

    onFormDataChange({
      ...formData,
      [field]: sanitizedValue
    });
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="businessName">Nome da Empresa *</Label>
        <Input
          id="businessName"
          name="businessName"
          value={formData.businessName}
          onChange={(e) => handleInputChange('businessName', e.target.value)}
          required
          maxLength={100}
          placeholder="Ex: Minha Empresa Ltda"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nome do Responsável *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
          maxLength={80}
          placeholder="Ex: João Silva"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email de Acesso *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
          maxLength={100}
          placeholder="Ex: joao@empresa.com"
          className={formData.email && !validateEmail(formData.email) ? 'border-destructive' : ''}
        />
        {formData.email && !validateEmail(formData.email) && (
          <p className="text-xs text-destructive">Email inválido</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="document">CNPJ/CPF</Label>
        <Input
          id="document"
          name="document"
          value={formData.document}
          onChange={(e) => handleInputChange('document', e.target.value)}
          maxLength={18}
          placeholder="Ex: 00.000.000/0000-00 ou 000.000.000-00"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPhone">WhatsApp para Contato</Label>
        <Input
          id="contactPhone"
          name="contactPhone"
          value={formData.contactPhone}
          onChange={(e) => handleInputChange('contactPhone', e.target.value)}
          maxLength={18}
          placeholder="Ex: +55 (12) 99788-6488"
        />
      </div>
    </div>
  );
}