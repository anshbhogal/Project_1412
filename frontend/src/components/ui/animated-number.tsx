import { useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function AnimatedNumber({
  value, 
  duration = 1000,
  prefix = '',
  suffix = ''
}: AnimatedNumberProps) {
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    setIsStarted(true);
  }, []);

  const { number } = useSpring({
    from: { number: 0 },
    number: isStarted ? value : 0,
    delay: 200,
    config: { duration: duration },
  });

  return <animated.span>{number.to((n) => {
    const formatter = new Intl.NumberFormat('en-IN', { // Use 'en-IN' locale for Indian Number format
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${prefix}${formatter.format(n)}${suffix}`;
  })}</animated.span>;
}
