import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
        destructive: 'bg-danger text-white hover:bg-danger/90',
        outline:
          'border border-primary-500 text-primary-600 bg-transparent hover:bg-primary-50 active:bg-primary-100',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary-600 underline-offset-4 hover:underline',
        success: 'bg-primary-600 text-white hover:bg-primary-700',
        tonal:
          'bg-primary-100 text-primary-700 hover:bg-primary-200 active:bg-primary-300',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
