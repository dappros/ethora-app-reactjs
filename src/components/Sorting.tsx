import {
  CloseButton,
  Field,
  Label,
  Popover,
  PopoverButton,
  PopoverPanel,
  Radio,
  RadioGroup,
} from '@headlessui/react';
import { IconAdd } from './Icons/IconAdd';
import { IconArrowDown } from './Icons/IconArrowDown';
import { IconMarked } from './Icons/IconMarked';

import './Sorting.scss';

interface OrderItem {
  key: string;
  title: string;
}

interface Props {
  orderByList: Array<OrderItem>;
  order: string;
  setOrder: (s: string) => void;
  orderBy: string;
  setOrderBy: (s: string) => void;
  className: string;
}

export function Sorting({
  orderByList,
  order,
  setOrder,
  orderBy,
  setOrderBy,
  className,
}: Props) {
  const orderItemList: Array<OrderItem> = [
    {
      title: '(A-Z)',
      key: 'asc',
    },
    {
      title: '(Z-A)',
      key: 'desc',
    },
  ];

  const printOrder = () => {
    const item = orderItemList.find((el) => el.key === order);
    return item?.title;
  };

  const printOrderBy = () => {
    const item = orderByList.find((el) => el.key === orderBy);
    return item?.title;
  };

  return (
    <div className={`gen-app-sorting ${className}`}>
      <span className="label">Sort by</span>
      <Popover className="relative">
        <PopoverButton className="gen-app-sorting-button">
          {printOrder()} - {printOrderBy()}
          <IconArrowDown width={16} height={16} />
        </PopoverButton>
        <PopoverPanel anchor="bottom" className="app-sorting-panel">
          <div className="app-sorting-panel-inner">
            <Field className="app-sorting-group-title mb-8">Order</Field>
            <RadioGroup
              className="app-sorting-radiogroup"
              value={order}
              onChange={(value) => {
                setOrder(value);
              }}
              aria-label="Server size"
            >
              {orderItemList.map((el) => (
                <CloseButton className="app-sorting-radio-outer">
                  <Field className="app-sorting-radio">
                    <Radio value={el.key} className="app-sorting-radio-input">
                      {(props) => {
                        return (
                          <div className="app-sorting-radio-content">
                            {props.checked && <IconMarked />}
                          </div>
                        );
                      }}
                    </Radio>
                    <Label>{el.title}</Label>
                  </Field>
                  <IconAdd />
                </CloseButton>
              ))}
            </RadioGroup>
            <Field className="app-sorting-group-title mb-8">Sort</Field>
            <RadioGroup
              className="app-sorting-radiogroup"
              value={orderBy}
              onChange={(value) => {
                setOrderBy(value);
              }}
              aria-label="Server size"
            >
              {orderByList.map((el) => {
                return (
                  <CloseButton key={el.key} className="app-sorting-radio-outer">
                    <Field className="app-sorting-radio">
                      <Radio value={el.key} className="app-sorting-radio-input">
                        {(props) => {
                          return (
                            <div className="app-sorting-radio-content">
                              {props.checked && <IconMarked />}
                            </div>
                          );
                        }}
                      </Radio>
                      <Label>{el.title}</Label>
                    </Field>
                    <IconAdd />
                  </CloseButton>
                );
              })}
            </RadioGroup>
          </div>
        </PopoverPanel>
      </Popover>
    </div>
  );
}
