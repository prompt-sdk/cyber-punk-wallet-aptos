import { FC } from 'react';
import classNames from 'classnames';
import { ComponentBaseProps } from '@/common/interfaces';

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

import DashboardAvatar from './dashboard-avatar';

type IDashboardAgentListProps = ComponentBaseProps & {
  items: {
    name: string;
    avatar: string;
  }[];
};

const DashboardAgentList: FC<IDashboardAgentListProps> = ({ className, items }) => {
  return (
    <Carousel opts={{ align: 'start', loop: true }} className={classNames('w-full', className)}>
      <CarouselContent>
        {items.map((item, index) => (
          <CarouselItem key={index} className="basis-1/2 md:basis-1/3">
            <div className="flex flex-col items-center gap-2">
              <DashboardAvatar imageUrl={item.avatar} altText={item.name} />
              <p>Agent {index + 1}</p>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export default DashboardAgentList;
