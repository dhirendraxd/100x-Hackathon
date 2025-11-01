/**
 * FieldWithHint Component
 * Provides intelligent contextual hints for form fields
 */

import { useState, useEffect } from 'react';
import { HelpCircle, Info, AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Badge } from './ui/badge';
import { getFieldGuidance, getContextualHint, type SmartHint } from '@/services/fieldHintService';
import { cn } from '@/lib/utils';

interface FieldWithHintProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showHints?: boolean; // Toggle hints on/off
}

export const FieldWithHint = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
  disabled = false,
  className,
  showHints = true,
}: FieldWithHintProps) => {
  const [contextualHint, setContextualHint] = useState<SmartHint | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  const guidance = getFieldGuidance(id, label);
  const effectivePlaceholder = placeholder || guidance.placeholder;

  // Update contextual hint as user types
  useEffect(() => {
    if (value && showHints) {
      const hint = getContextualHint(id, value, type);
      setContextualHint(hint);
    } else {
      setContextualHint(null);
    }
  }, [value, id, type, showHints]);

  const getHintIcon = (hintType: SmartHint['type']) => {
    switch (hintType) {
      case 'warning':
        return <AlertTriangle className="h-3 w-3" />;
      case 'info':
        return <Info className="h-3 w-3" />;
      case 'tip':
        return <Lightbulb className="h-3 w-3" />;
      case 'example':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  const getHintColor = (hintType: SmartHint['type']) => {
    switch (hintType) {
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'info':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'tip':
        return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'example':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="flex items-center gap-2">
          {label}
          {required && <span className="text-red-500">*</span>}
          
          {/* Help tooltip with detailed guidance */}
          {showHints && guidance.tips && guidance.tips.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    onClick={(e) => e.preventDefault()}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-sm p-4 bg-card border-white/10">
                  <div className="space-y-3">
                    {/* Main hint */}
                    <div>
                      <p className="font-semibold text-sm text-white mb-1">
                        {guidance.label}
                      </p>
                      <p className="text-xs text-gray-300">
                        {guidance.hint}
                      </p>
                    </div>
                    
                    {/* Example */}
                    {guidance.example && (
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-xs font-semibold text-green-400 mb-1">
                          Example:
                        </p>
                        <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/20">
                          {guidance.example}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Tips */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      {guidance.tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className={cn('mt-0.5', getHintColor(tip.type))}>
                            {getHintIcon(tip.type)}
                          </span>
                          <p className="text-xs text-gray-300">
                            {tip.text}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Common mistakes */}
                    {guidance.commonMistakes && guidance.commonMistakes.length > 0 && (
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-xs font-semibold text-yellow-400 mb-1">
                          Common Mistakes:
                        </p>
                        <ul className="text-xs text-gray-300 space-y-1">
                          {guidance.commonMistakes.map((mistake, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-yellow-400">•</span>
                              <span>{mistake}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Label>
        
        {/* Quick example badge */}
        {showHints && guidance.example && isFocused && (
          <Badge 
            variant="outline" 
            className="text-xs bg-green-500/10 border-green-500/20 text-green-400"
          >
            e.g. {guidance.example}
          </Badge>
        )}
      </div>
      
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={effectivePlaceholder}
        disabled={disabled}
        required={required}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'transition-all',
          contextualHint?.type === 'warning' && 'border-yellow-500/50 focus:border-yellow-500',
          contextualHint?.type === 'info' && value && 'border-green-500/50 focus:border-green-500'
        )}
      />
      
      {/* Contextual hint below field */}
      {showHints && contextualHint && (
        <div
          className={cn(
            'flex items-start gap-2 p-2 rounded-md text-xs border animate-in fade-in slide-in-from-top-1 duration-200',
            getHintColor(contextualHint.type)
          )}
        >
          {getHintIcon(contextualHint.type)}
          <span>{contextualHint.text}</span>
        </div>
      )}
      
      {/* Show main hint on focus if no contextual hint */}
      {showHints && isFocused && !contextualHint && !value && (
        <p className="text-xs text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-200">
          💡 {guidance.hint}
        </p>
      )}
    </div>
  );
};

export default FieldWithHint;
