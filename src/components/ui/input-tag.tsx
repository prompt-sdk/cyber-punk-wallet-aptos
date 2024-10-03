import { CircleXIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '../utils';

type InputTagProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  value?: string;
  onChange?: (value: string) => void;
};

export const InputTag = React.forwardRef<HTMLInputElement, InputTagProps>(({ className, type = 'text', value = '', onChange, ...props }, ref) => {
  const [keywords, setKeywords] = React.useState(() =>
    value
      .split(',')
      .map(kw => kw.trim())
      .filter(Boolean)
  );
  const [inputValue, setInputValue] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(inputRef.current);
      } else {
        ref.current = inputRef.current;
      }
    }
  }, [ref]);

  React.useEffect(() => {
    const newKeywords = value
      .split(',')
      .map(kw => kw.trim())
      .filter(Boolean);
    if (JSON.stringify(newKeywords) !== JSON.stringify(keywords)) {
      setKeywords(newKeywords);
    }
  }, [value]);

  const updateKeywords = React.useCallback(
    (newKeywords: string[]) => {
      setKeywords(newKeywords);
      onChange?.(newKeywords.join(','));
    },
    [onChange]
  );

  const addKeyword = (keyword: string) => {
    if (keyword && !keywords.includes(keyword)) {
      updateKeywords([...keywords, keyword]);
    }
  };

  const removeKeyword = (index: number) => {
    updateKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addKeyword(inputValue.trim());
      setInputValue('');
    }
  };

  const handleContainerBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsFocused(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'border-input gap-1 bg-background ring-offset-background focus-within:ring-ring flex flex-wrap items-center rounded-md border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2',
        isFocused && 'ring-ring ring-2 ring-offset-2',
        className
      )}
      onFocus={() => setIsFocused(true)}
      onBlur={handleContainerBlur}
      onClick={() => inputRef.current?.focus()}
    >
      {keywords.map((keyword, index) => (
        <span
          key={index}
          className={cn(
            'bg-secondary focus:ring-ring inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
          )}
        >
          {keyword}
          <button type="button" onClick={() => removeKeyword(index)} className="hover:text-muted-foreground ml-1 rounded-full outline-none">
            <CircleXIcon size={12} className='text-muted-foreground' />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type={type}
        className="placeholder:text-muted-foreground flex-1 bg-transparent outline-none"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleInputKeyDown}
        {...props}
      />
    </div>
  );
});

InputTag.displayName = 'InputTag';
