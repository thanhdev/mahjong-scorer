
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { X, Check, Backspace } from "lucide-react";

interface NumpadProps {
  value: number;
  onChange: (value: number) => void;
  onSubmit: () => void;
}

export default function Numpad({ value, onChange, onSubmit }: NumpadProps) {
  const handleNumberClick = (num: number) => {
    // Append number to the end
    const newValueString = `${value}${num}`;
    onChange(parseInt(newValueString, 10));
  };

  const handleBackspace = () => {
    const valueString = value.toString();
    if (valueString.length > 1) {
      onChange(parseInt(valueString.slice(0, -1), 10));
    } else {
      onChange(0);
    }
  };

  const handleClear = () => {
    onChange(0);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num)) {
      onChange(num);
    } else {
      onChange(0);
    }
  };

  return (
    <div className="space-y-2">
       <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        className="w-full text-center text-2xl font-bold h-12 mb-4"
        />
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <Button
            key={num}
            type="button"
            variant="outline"
            className="h-14 text-lg"
            onClick={() => handleNumberClick(num)}
          >
            {num}
          </Button>
        ))}
         <Button
            type="button"
            variant="outline"
            className="h-14 text-lg"
            onClick={handleClear}
            >
           <X className="h-5 w-5" />
        </Button>
         <Button
            type="button"
            variant="outline"
            className="h-14 text-lg"
            onClick={() => handleNumberClick(0)}
          >
            0
          </Button>
        <Button
          type="button"
          variant="outline"
          className="h-14 text-lg"
          onClick={handleBackspace}
        >
          <Backspace className="h-5 w-5" />
        </Button>
      </div>
       <Button
            type="button"
            onClick={onSubmit}
            className="w-full h-14 mt-2 bg-green-600 hover:bg-green-700"
            >
            <Check className="h-6 w-6 mr-2" /> Enter
        </Button>
    </div>
  );
}
