import { ReactElement, useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import { useParams } from "react-router-dom";
import { format, subDays, subHours } from "date-fns";
import { DateRange } from 'react-date-range';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

// Components
import { LineChartLocal } from "../../../components/Statistics/LineChartLocal";

// Http
import { httpGetGraphStatistic, httpWithAuth } from "../../../http";

// Icons
import downloadIcon from "../../../assets/icons/Download.svg";

// Data
const tabs: Record<string, string>[] = [
  { name: "Users", value: "user", disabled: "disabled" },
  { name: "Sessions", value: "sessions" },
  { name: "Chats", value: "chats", disabled: "disabled"  },
  { name: "API calls", value: "apiCalls" },
  { name: "Assets", value: "issuance" },
  { name: "Transactions", value: "transactions" },
];
const timePeriods = ["24 hours", "7 days", "30 days", "Select period"];

export const AdminAppStatistics = (): ReactElement => {
  const { appId } = useParams<string>();

  const [graphStatistics, setGraphStatistics] = useState<Record<string, { value: number, name: string }[]>>({});
  const [graphStatisticsCont, setGraphStatisticsCount] = useState<Record<string, number>>({});
  const [selectedTab, setSelectedTab] = useState(tabs[1]);
  const [timePeriod, setTimePeriod] = useState<string>("7 days");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [customRangeVisible, setCustomRangeVisible] = useState<boolean>(false);

  console.log("graphStatisticsCont", graphStatisticsCont)
  
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  const calculateDates = (period: string) => {
    const endDate = new Date();
    let startDate;

    switch (period) {
      case "24 hours":
        startDate = subHours(endDate, 24);
        break;
      case "7 days":
        startDate = subDays(endDate, 7);
        break;
      case "30 days":
        startDate = subDays(endDate, 30);
        break;
      default:
        startDate = new Date();
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
    }

    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
  };

  const [dates, setDates] = useState(() => calculateDates(timePeriod));

  const getData = async () => {
    const convert = (data: Record<string, { x: number[], y: number[] } | number>) => {
      const result: Record<string, { value: number, name: string }[]> = {};
      for(const d in data) {
        if (typeof data[d] === "number") {
          if( d === "apiCallCount") {
            setGraphStatisticsCount((count) => {
              return {
                ...count,
                apiCalls: data[d] as number
              }
            });
            continue;
          }
          setGraphStatisticsCount((count) => {
            return {
              ...count,
              [d.slice(0, -5)]: data[d] as number
            }
          });
          continue;
        };
        const converted = [];

        for (const [index, value] of data[d].y.entries()) {
          converted.push({
            value: value,
            name: format(new Date(data[d].x[index]), "yyyy-MM-dd"),
          });
        }

        result[d] = converted;
      }

      return result;
    };

    try {
      if (appId) {
        const { data } = await httpGetGraphStatistic(appId, dates.startDate, dates.endDate);
        const response = convert(data);
        setGraphStatistics(response);
      };
    } catch (error) {
      console.error(error);
    }
  };

  const statistics = useMemo(() => {
    let formattedPeriod = timePeriod;

    if (timePeriod !== "Select period") {
      const startDateFormatted = format(new Date(dates.startDate), "dd MMM yyyy");
      const endDateFormatted = format(new Date(dates.endDate), "dd MMM yyyy");
      formattedPeriod = `${timePeriod} (${startDateFormatted} - ${endDateFormatted})`;
    }

    return {
      title: selectedTab.name,
      value: graphStatisticsCont[selectedTab.value],
      period: formattedPeriod
    }
  }, [selectedTab.name, timePeriod, dates]);

  const handleOptionClick = (option: string) => {
    setTimePeriod(option);
    setIsOpen(false);

    if (option === "Select period") {
      setCustomRangeVisible(true);
    } else {
      setDates(calculateDates(option));
      setCustomRangeVisible(false);
    }
  };

  const handleApplyCustomPeriod = () => {
    setDates({
      startDate: dateRange[0].startDate.toISOString() ?? new Date(),
      endDate: dateRange[0].endDate.toISOString() ?? new Date(),
    });
    setCustomRangeVisible(false);
  };
  
  const onUploadCsv = async () => {
    const response = await httpWithAuth(dates.startDate, dates.endDate);

    const dataUrl = "data:text/csv," + response.data;
    const filename = "api.csv";

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
  };
  useEffect(() => {
    getData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, dates]);

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold hidden md:block">Statistics</h2>

        <div className="flex items-center gap-4 justify-between md:justify-end w-full">
          <div className="relative w-64">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full h-10 px-4 flex justify-between items-center bg-gray-100 text-gray-950 border border-brand-500 rounded-xl focus:outline-none`}
            >
              <span>{timePeriod}</span>
              <span className={`transform transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}>
                &#9662;
              </span>
            </button>

            {isOpen && (
              <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                {timePeriods.map((option) => (
                  <div
                    key={option}
                    onClick={() => handleOptionClick(option)}
                    className={classNames(
                      "px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center",
                      option === timePeriod ? "text-brand-500 font-semibold" : "text-gray-700"
                    )}
                  >
                    <div className="w-4 mr-2 flex items-center justify-center">
                      {option === timePeriod && (
                        <span className=" text-brand-500">&#10003;</span>
                      )}
                    </div>
                    {option}
                  </div>
                ))}
              </div>
            )}

            {customRangeVisible && (
              <div className="absolute top-16 z-20 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
                <DateRange
                  editableDateInputs={true}
                  onChange={item => setDateRange([{
                    startDate: item.selection.startDate ?? new Date(),
                    endDate: item.selection.endDate ?? new Date(),
                    key: 'selection'
                  }])}
                  moveRangeOnFirstSelection={false}
                  ranges={dateRange}
                />
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => setCustomRangeVisible(false)}
                    className="bg-gray-200 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyCustomPeriod}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={onUploadCsv}
              className="flex items-center px-2 sm:px-7 py-2 text-white border border-brand-500 rounded-xl"
            >
              <img src={downloadIcon} alt="Download" />
              <span className="text-brand-500 pl-3 hidden xs:block">Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row mt-4 ">
        <div className="md:w-1/4 mb-4 pr-4 md:mb-0 border-b md:border-b-0 md:border-r border-gray-200">
          <ul className="space-y-2 flex justify-between items-center md:block overflow-x-auto scrollbar-hide">
            {tabs.map((tab, index) => (
              <li
                key={tab.name}
                className={classNames(
                  "pb-2",
                  index !== tabs.length - 1 && "md:border-b border-gray-200"
                )}
                onClick={() => !tab.disabled && setSelectedTab(tab)}
              >
                <div className={classNames(
                  "w-full py-3 px-4 p-2 rounded-lg cursor-pointer",
                  selectedTab.name === tab.name ? "md:bg-brand-150" : "",
                  tab.disabled ? "cursor-not-allowed bg-gray-100" : "",
                )}>
                  <span className={classNames(
                    "text-sm md:text-base whitespace-nowrap",
                    selectedTab.name === tab.name ? "text-brand-500 font-semibold" : "text-gray-500 md:text-gray-950",
                    tab.disabled ? "text-gray-400 md:text-gray-400" : ""
                  )}>
                    {tab.name}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:w-3/4 md:pl-4">
          <div className="flex items-center space-x-2">
          <div>
            <span className="text-4xl font-bold text-brand-500">{statistics.value}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500">{statistics.title.toLowerCase()}</span>
            <p className="text-gray-500 text-sm">For {statistics.period}</p>
          </div>
          </div>
          <div className="mt-6 rounded-lg h-48 xs:h-[415px] flex items-center justify-center">
            <LineChartLocal data={graphStatistics[selectedTab.value]} name={selectedTab.name} />
          </div>
        </div>
      </div>
    </>
  );
};
