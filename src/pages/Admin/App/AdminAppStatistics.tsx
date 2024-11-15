import { ReactElement, useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import { useParams } from "react-router-dom";
import { format, subDays, subHours } from "date-fns";

// Components
import { LineChartLocal } from "../../../components/Statistics/LineChartLocal";

// Http
import { httpGetGraphStatistic } from "../../../http";

// Icons
import downloadIcon from "../../../assets/icons/Download.svg";

// Daa
const tabs: Record<string, string>[] = [
  {name: "Users", value: "user"},
  {name: "Sessions", value: "sessions"},
  {name: "Chats", value: "chats"},
  {name: "API calls", value: "apiCalls"},
  {name: "Assets", value: "issuance"},
  {name: "Transactions", value: "transactions"},
];
const timePeriods = ['24 hours', '7 days', '30 days', 'Select period'];

export const AdminAppStatistics = (): ReactElement => {
  const { appId } = useParams<string>();

  const [graphStatistics, setGraphStatistics] = useState<Record<string, { value: number, name: string }[]>>({});
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const [timePeriod, setTimePeriod] = useState<string>('7 days');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [customStartDate, setCustomStartDate] = useState<string | null>(null);
  const [customEndDate, setCustomEndDate] = useState<string | null>(null);

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
        if (typeof data[d] === "number") continue;
        const converded = [];
        
        for (const [index, value] of data[d].y.entries()) {
          converded.push({
            value: value,
            name: format(new Date(data[d].x[index]), "yyyy-MM-dd"),
          });
        }
        
        result[d] = converded;
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
    return {
      title: selectedTab.name,
      value: 1024,
      period: timePeriod
    }
  }, [selectedTab.name, timePeriod]);

  const handleOptionClick = (option: string) => {
    setTimePeriod(option);
    setIsOpen(false);

    if (option === "Select period") {
      setCustomStartDate(null);
      setCustomEndDate(null);
    } else {
      setDates(calculateDates(option));
    }
  };

  const handleApplyCustomPeriod = () => {
    if (customStartDate && customEndDate) {
      setDates({
        startDate: customStartDate,
        endDate: customEndDate,
      });
      setIsOpen(false);
    }
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
              className={`
                w-full h-10 px-4 flex justify-between items-center
                bg-gray-100 text-gray-950 border border-brand-500 rounded-xl focus:outline-none  
              `}
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

            {timePeriod === "Select period" && (
              <div className="z-10 p-4 absolute bg-white border border-gray-200 rounded-xl">
                <label>
                  Start Date:
                  <input
                    type="date"
                    value={customStartDate ? format(new Date(customStartDate), "yyyy-MM-dd") : ""}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="block w-full mt-1 p-2 border rounded"
                  />
                </label>
                <label className="mt-2">
                  End Date:
                  <input
                    type="date"
                    value={customEndDate ? format(new Date(customEndDate), "yyyy-MM-dd") : ""}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="block w-full mt-1 p-2 border rounded"
                  />
                </label>
                <button
                  onClick={handleApplyCustomPeriod}
                  className="mt-4 w-full bg-brand-500 text-white py-2 rounded"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button className={`
              flex items-center
              px-7 py-2  text-white
              border border-brand-500 rounded-xl
            `}>
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
                onClick={() => setSelectedTab(tab)}
              >
                <div className={classNames(
                  "w-full py-3 px-4 p-2 rounded-lg cursor-pointer",
                  selectedTab.name === tab.name ? 'md:bg-gray-150' : 'md:hover:bg-gray-100',
                )}>
                  <span className={classNames(
                    "text-sm md:text-base whitespace-nowrap",
                    selectedTab.name === tab.name ? "text-brand-500 font-semibold" : "text-gray-500 md:text-gray-950"
                  )}>{tab.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:w-3/4 md:pl-4">
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-bold">{statistics.value}</span>
            <span className="text-sm text-gray-500">{statistics.title.toLowerCase()}</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">For {statistics.period}</p>

   

          <div className="mt-6 bg-gray-100 rounded-lg h-48 xs:h-[400px] flex items-center justify-center">
            <LineChartLocal data={graphStatistics[selectedTab.value] || []} name={selectedTab.name} />
          </div>
    
        </div>
      </div>
    </>
  );
}
