import { useState } from 'react';
import { Card, ButtonGroup, Button, Form, Row, Col } from 'react-bootstrap';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { BsGraphUpArrow } from 'react-icons/bs';
import { useGetDashboardSalesQuery } from '../slices/dashboardApiSlice.js';

const SALES_PERIODS = [
  { value: '7days', label: '7 Days' },
  { value: '30days', label: '30 Days' },
  { value: '3months', label: '3 Months' },
  { value: '1year', label: '1 Year' },
];

const SalesOverview = () => {
  const [period, setPeriod] = useState('7days');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [customRangeApplied, setCustomRangeApplied] = useState(false);

  const shouldFetchCustomRange =
    period !== 'custom' || (customRangeApplied && dateFrom && dateTo);

  const { data, isLoading, isFetching, error } = useGetDashboardSalesQuery(
    period === 'custom'
      ? {
          period,
          dateFrom,
          dateTo,
        }
      : {
          period,
        },
    {
      skip: !shouldFetchCustomRange,
    },
  );

  const handlePeriodChange = (selectedPeriod) => {
    setPeriod(selectedPeriod);
    setCustomRangeApplied(false);
  };

  const handleCustomRange = () => {
    if (!dateFrom || !dateTo) {
      return;
    }

    if (dateFrom > dateTo) {
      return;
    }

    setPeriod('custom');
    setCustomRangeApplied(true);
  };

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN')}`;

  const chartData = data?.sales || [];

  const getOrdinalSuffix = (day) => {
    if (day > 10 && day < 20) {
      return 'th';
    }

    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  const formatTooltipDate = (dateValue) => {
    const date = new Date(dateValue);

    const day = date.getDate();
    const month = date.toLocaleDateString('en-IN', {
      month: 'short',
    });
    const year = date.getFullYear();

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };

  return (
    <Card className='admin-dashboard-section-card'>
      <Card.Body>
        <div className='admin-dashboard-section-header'>
          <div>
            <h2 className='admin-dashboard-section-title'>Sales Overview</h2>

            <p className='admin-dashboard-section-subtitle'>
              Track your store's sales performance over time
            </p>
          </div>

          <div className='admin-dashboard-section-icon'>
            <BsGraphUpArrow />
          </div>
        </div>

        <div className='admin-dashboard-sales-summary'>
          <span className='admin-dashboard-sales-summary-label'>
            Total Sales
          </span>

          <span className='admin-dashboard-sales-summary-value'>
            {formatCurrency(data?.totalSales)}
          </span>
        </div>

        <div className='admin-dashboard-sales-periods'>
          <ButtonGroup>
            {SALES_PERIODS.map((salesPeriod) => (
              <Button
                key={salesPeriod.value}
                type='button'
                className={
                  period === salesPeriod.value
                    ? 'admin-dashboard-sales-period active'
                    : 'admin-dashboard-sales-period'
                }
                onClick={() => handlePeriodChange(salesPeriod.value)}
              >
                {salesPeriod.label}
              </Button>
            ))}

            <Button
              type='button'
              className={
                period === 'custom'
                  ? 'admin-dashboard-sales-period active'
                  : 'admin-dashboard-sales-period'
              }
              onClick={() => {
                setPeriod('custom');
                setCustomRangeApplied(false);
              }}
            >
              Custom Range
            </Button>
          </ButtonGroup>
        </div>

        {period === 'custom' && (
          <div className='admin-dashboard-custom-range'>
            <Row className='g-3 align-items-end'>
              <Col sm={5} md={4}>
                <Form.Group controlId='salesDateFrom'>
                  <Form.Label>From</Form.Label>
                  <Form.Control
                    type='date'
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setCustomRangeApplied(false);
                    }}
                  />
                </Form.Group>
              </Col>

              <Col sm={5} md={4}>
                <Form.Group controlId='salesDateTo'>
                  <Form.Label>To</Form.Label>
                  <Form.Control
                    type='date'
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setCustomRangeApplied(false);
                    }}
                  />
                </Form.Group>
              </Col>

              <Col sm={2} md='auto'>
                <Button
                  type='button'
                  className='admin-dashboard-custom-range-button'
                  onClick={handleCustomRange}
                  disabled={!dateFrom || !dateTo || dateFrom > dateTo}
                >
                  Apply
                </Button>
              </Col>
            </Row>
          </div>
        )}

        {period === 'custom' && !customRangeApplied ? (
          <div className='admin-dashboard-sales-empty'>
            Select a date range and click Apply to view sales.
          </div>
        ) : isLoading || isFetching ? (
          <div className='admin-dashboard-sales-empty'>Loading sales...</div>
        ) : error ? (
          <div className='admin-dashboard-sales-empty'>
            Unable to load sales data.
          </div>
        ) : (
          <div className='admin-dashboard-sales-chart'>
            <ResponsiveContainer width='100%' height={320}>
              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 10,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray='3 3' vertical={false} />

                <ReferenceLine y={0} stroke='#b08d57' strokeWidth={1} />

                <XAxis
                  dataKey='label'
                  tickLine={false}
                  axisLine={false}
                  interval={period === '30days' ? 4 : 0}
                />

                <YAxis
                  tickLine={false}
                  axisLine={{
                    stroke: '#b08d57',
                    strokeWidth: 1,
                  }}
                  tickFormatter={(value) =>
                    value === 0
                      ? ''
                      : `₹${Number(value).toLocaleString('en-IN')}`
                  }
                />

                <Tooltip
                  labelFormatter={(_, payload) => {
                    const date = payload?.[0]?.payload?.date;

                    return date ? formatTooltipDate(date) : '';
                  }}
                  formatter={(value) => [formatCurrency(value), 'Sales']}
                />

                <Line
                  type='monotone'
                  dataKey='sales'
                  stroke='#b08d57'
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    fill: '#b08d57',
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default SalesOverview;
