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
    <div className={`flex ${className}`}>
      <span className="text-[#8C8C8C] text-[14px] mr-2">Sort by</span>
      <Popover className="relative">
        <PopoverButton className="flex items-center">
          <div className="mr-2 text-brand-500 font-semibold">
            {printOrder()} - {printOrderBy()}
          </div>

          <IconArrowDown width={16} height={16} />
        </PopoverButton>
        <PopoverPanel anchor="bottom" className="bg-transparent rounded-xl">
          <div className="w-[240px] m-2 bg-white shadow p-4 rounded-xl">
            <Field className="font-semibold text-regular mb-2">Order</Field>
            <RadioGroup
              className="flex flex-col"
              value={order}
              onChange={(value) => {
                setOrder(value);
              }}
              aria-label="Server size"
            >
              {orderItemList.map((el) => (
                <Field className="flex">
                  <Label className="cursor-pointer w-full hover:bg-[#F5F7F9] p-2 rounded-xl">
                    <CloseButton className="flex w-full items-center justify-between relative ">
                      <div>
                        <Radio value={el.key} className="">
                          {(props) => {
                            return (
                              <div className="absolute left-0">
                                {props.checked && <IconMarked />}
                              </div>
                            );
                          }}
                        </Radio>
                        <div className="ml-8">{el.title}</div>
                      </div>

                      <IconAdd />
                    </CloseButton>
                  </Label>
                </Field>

              ))}
            </RadioGroup>
            <Field className="font-semibold text-regular mb-2">Sort</Field>
            <RadioGroup
              className="flex flex-col"
              value={orderBy}
              onChange={(value) => {
                setOrderBy(value);
              }}
              aria-label="Server size"
            >
              {orderByList.map((el) => {
                return (
                  <Field className="flex">
                    <Label className="cursor-pointer w-full hover:bg-[#F5F7F9] p-2 rounded-xl">
                      <CloseButton className="flex w-full items-center justify-between relative">
                        <div>
                          <Radio value={el.key} className="">
                            {(props) => {
                              return (
                                <div className="absolute left-0">
                                  {props.checked && <IconMarked />}
                                </div>
                              );
                            }}
                          </Radio>
                          <div className="ml-8 font-sans text-[14px]">{el.title}</div>
                        </div>
                        <div className="w-[24px] h-[24px] flex justify-center items-center">
                          <IconAdd />
                        </div>
                      </CloseButton>
                    </Label>
                  </Field>
                );
              })}
            </RadioGroup>
          </div>
        </PopoverPanel>
      </Popover>
    </div>
  );
}
