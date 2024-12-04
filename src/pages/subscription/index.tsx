import React, { useEffect, useState } from 'react';
import { Button, Card, CardContent, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Api, Product } from '../../services/api.ts';
import { useParams } from 'react-router-dom';

const SubscriptionPlans = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const { team_id } = useParams<{ team_id: string }>();
  const [teamIdNumber, setTeamIdNumber] = useState(0);
  const [loading, setLoading] = useState(true)
  const [subscriptionPlans, setSubscriptionPlans] = useState<Product[]>([]);
  const recurringType = billingCycle === 'monthly' ? 'month' : 'year'
  useEffect(() => {
    if (!team_id) return
    setTeamIdNumber(Number(team_id));
  }, [team_id]);

  const loadSubscriptionPlans = async () => {
    const res = await Api.fetchSubscriptionPlans();
    setSubscriptionPlans(res.data.results.sort((plan1, plan2) => plan1.prices[0].unit_amount - plan2.prices[0].unit_amount));
    setLoading(false)
  };

  useEffect(() => {
    loadSubscriptionPlans();
  }, []);

  const handleBillingChange = (event, newBillingCycle) => {
    if (newBillingCycle) {
      setBillingCycle(newBillingCycle);
    }
  };

  const changePlan = async (plan: Product) => {
    const price = plan.prices.find(price => price.recurring_type === recurringType)
    if (!price) return
    const res = await Api.changeSubscriptionPlan(teamIdNumber, price.id);
    console.log(res.data.redirect_url)
    window.location.href = res.data.redirect_url
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Choose Your Subscription Plan
      </Typography>
      <ToggleButtonGroup
        value={billingCycle}
        exclusive
        onChange={handleBillingChange}
        style={{ marginBottom: '20px' }}
      >
        <ToggleButton value="monthly">Monthly</ToggleButton>
        <ToggleButton value="annual">Annual</ToggleButton>
      </ToggleButtonGroup>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {loading && <Typography>Loading...</Typography>}
        {subscriptionPlans.map((plan) => (
          <Card key={plan.name} style={{ width: '200px' }}>
            <CardContent>
              <Typography variant="h5">{plan.name}</Typography>
              <Typography variant="h6">
                Price: {plan.prices.find(price => price.recurring_type === recurringType)?.human_readable_price}
              </Typography>
              <Typography variant="h6">
                No of seats: {plan.metadata.seat_limit}
              </Typography>
              <Typography variant="h6">
                No of feeds: {plan.metadata.feed_limit}
              </Typography>
              <Button variant="contained" color="primary" style={{ marginTop: '10px' }}
                onClick={() => changePlan(plan)}>
                Select Plan
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;