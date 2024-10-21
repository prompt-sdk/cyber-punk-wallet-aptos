import { ExternalLink } from './external-link';
import BoderImage from '@/components/common/border-image';
import WidgetFrame2 from '@/assets/svgs/widget-frame-2.svg';

export function EmptyScreen() {
  return (
    <BoderImage
      imageBoder={WidgetFrame2.src} // Use your desired border image URL
      className="mx-auto flex max-w-xl flex-col gap-2 rounded-lg border bg-background p-8 px-4 text-center"
    >
      <h1 className="text-lg font-semibold">Start Your Prompt Here!</h1>
      <p className="leading-normal text-muted-foreground">
        Please upload{' '}
        <ExternalLink href="https://docs.google.com/document/d/1UZRfOE1JAOhsnSmp-RmL2hY7KPJbpBImKZVvPV4YJmA/">
          Template file
        </ExternalLink>
      </p>
    </BoderImage>
  );
}
