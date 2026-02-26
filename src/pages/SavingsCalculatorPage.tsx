import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getSavingsProducts, SavingsProduct } from 'remotes/fetcher';
import {
  Assets,
  Border,
  colors,
  ListHeader,
  ListRow,
  NavigationBar,
  SelectBottomSheet,
  Spacing,
  Tab,
  TextField,
} from 'tosslib';

export function SavingsCalculatorPage() {
  const [targetAmount, setTargetAmount] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [term, setTerm] = useState(12);

  const [selectedSavingsProduct, setSelectedSavingsProduct] = useState<SavingsProduct | null>(null);

  const [selectedTab, setSelectedTab] = useState<'products' | 'results'>('products');

  const { data: savingsProducts } = useSuspenseQuery({
    queryKey: ['savingsProducts'],
    queryFn: getSavingsProducts,
  });

  return (
    <>
      <NavigationBar title="적금 계산기" />

      <Spacing size={16} />

      <TextField
        label="목표 금액"
        placeholder="목표 금액을 입력하세요"
        suffix="원"
        value={targetAmount.toLocaleString('ko-KR')}
        onChange={e => {
          const value = e.target.value.replace(/,/g, '');
          if (isNaN(Number(value))) {
            return;
          }

          setTargetAmount(Number(value));
        }}
      />
      <Spacing size={16} />
      <TextField
        label="월 납입액"
        placeholder="희망 월 납입액을 입력하세요"
        suffix="원"
        value={monthlyPayment.toLocaleString()}
        onChange={e => {
          const value = e.target.value.replace(/,/g, '');
          if (isNaN(Number(value))) {
            return;
          }

          setMonthlyPayment(Number(value));
        }}
      />
      <Spacing size={16} />
      <SelectBottomSheet label="저축 기간" title="저축 기간을 선택해주세요" value={term} onChange={setTerm}>
        <SelectBottomSheet.Option value={6}>6개월</SelectBottomSheet.Option>
        <SelectBottomSheet.Option value={12}>12개월</SelectBottomSheet.Option>
        <SelectBottomSheet.Option value={24}>24개월</SelectBottomSheet.Option>
      </SelectBottomSheet>

      <Spacing size={24} />
      <Border height={16} />
      <Spacing size={8} />

      <Tab onChange={value => setSelectedTab(value as 'products' | 'results')}>
        <Tab.Item value="products" selected={selectedTab === 'products'}>
          적금 상품
        </Tab.Item>
        <Tab.Item value="results" selected={selectedTab === 'results'}>
          계산 결과
        </Tab.Item>
      </Tab>

      {selectedTab === 'products' && (
        <>
          {savingsProducts
            .filter(product => {
              return (
                product.minMonthlyAmount < monthlyPayment &&
                product.maxMonthlyAmount > monthlyPayment &&
                product.availableTerms === term
              );
            })
            .map(product => {
              return (
                <ListRow
                  key={product.id}
                  contents={
                    <ListRow.Texts
                      type="3RowTypeA"
                      top={product.name}
                      topProps={{ fontSize: 16, fontWeight: 'bold', color: colors.grey900 }}
                      middle={`연 이자율: ${product.annualRate}%`}
                      middleProps={{ fontSize: 14, color: colors.blue600, fontWeight: 'medium' }}
                      bottom={`${product.minMonthlyAmount.toLocaleString('ko-KR')}원 ~ ${product.maxMonthlyAmount.toLocaleString('ko-KR')}원 | ${product.availableTerms}개월`}
                      bottomProps={{ fontSize: 13, color: colors.grey600 }}
                    />
                  }
                  right={
                    selectedSavingsProduct?.id === product.id ? <Assets.Icon name="icon-check-circle-green" /> : null
                  }
                  onClick={() => {
                    setSelectedSavingsProduct(product);
                  }}
                />
              );
            })}
        </>
      )}

      {/* 아래는 계산 결과 탭 내용이에요. 계산 결과 탭을 구현할 때 주석을 해제해주세요. */}
      <Spacing size={8} />

      {selectedTab === 'results' && (
        <>
          {selectedSavingsProduct ? (
            <>
              <ListRow
                contents={
                  <ListRow.Texts
                    type="2RowTypeA"
                    top="예상 수익 금액"
                    topProps={{ color: colors.grey600 }}
                    // 공식: 최종 금액 = 월 납입액 * 저축 기간 * (1 + 연이자율 * 0.5)
                    bottom={(monthlyPayment * term * (1 + selectedSavingsProduct.annualRate * 0.5)).toLocaleString(
                      'ko-KR'
                    )}
                    bottomProps={{ fontWeight: 'bold', color: colors.blue600 }}
                  />
                }
              />
              <ListRow
                contents={
                  <ListRow.Texts
                    type="2RowTypeA"
                    top="목표 금액과의 차이"
                    topProps={{ color: colors.grey600 }}
                    // 목표 금액과의 차이 = 목표 금액 - 예상 수익 금액
                    bottom={(
                      targetAmount -
                      monthlyPayment * term * (1 + selectedSavingsProduct.annualRate * 0.5)
                    ).toLocaleString('ko-KR')}
                    bottomProps={{ fontWeight: 'bold', color: colors.blue600 }}
                  />
                }
              />
              <ListRow
                contents={
                  <ListRow.Texts
                    type="2RowTypeA"
                    top="추천 월 납입 금액"
                    topProps={{ color: colors.grey600 }}
                    // 월 납입액 = 목표 금액 ÷ (저축 기간 * (1 + 연이자율 * 0.5))
                    // 1,000원 단위로 반올림
                    bottom={천원_단위_반올림(
                      targetAmount / (term * (1 + selectedSavingsProduct.annualRate * 0.5))
                    ).toLocaleString('ko-KR')}
                    bottomProps={{ fontWeight: 'bold', color: colors.blue600 }}
                  />
                }
              />
            </>
          ) : (
            <ListRow contents={<ListRow.Texts type="1RowTypeA" top="상품을 선택해주세요." />} />
          )}

          <Spacing size={8} />
          <Border height={16} />
          <Spacing size={8} />

          <ListHeader title={<ListHeader.TitleParagraph fontWeight="bold">추천 상품 목록</ListHeader.TitleParagraph>} />
          <Spacing size={12} />

          <ListRow
            contents={
              <ListRow.Texts
                type="3RowTypeA"
                top={'기본 정기적금'}
                topProps={{ fontSize: 16, fontWeight: 'bold', color: colors.grey900 }}
                middle={`연 이자율: 3.2%`}
                middleProps={{ fontSize: 14, color: colors.blue600, fontWeight: 'medium' }}
                bottom={`100,000원 ~ 500,000원 | 12개월`}
                bottomProps={{ fontSize: 13, color: colors.grey600 }}
              />
            }
            onClick={() => {}}
          />
          <ListRow
            contents={
              <ListRow.Texts
                type="3RowTypeA"
                top={'고급 정기적금'}
                topProps={{ fontSize: 16, fontWeight: 'bold', color: colors.grey900 }}
                middle={`연 이자율: 2.8%`}
                middleProps={{ fontSize: 14, color: colors.blue600, fontWeight: 'medium' }}
                bottom={`50,000원 ~ 1,000,000원 | 24개월`}
                bottomProps={{ fontSize: 13, color: colors.grey600 }}
              />
            }
            onClick={() => {}}
          />
        </>
      )}

      <Spacing size={40} />
    </>
  );
}

function 천원_단위_반올림(value: number) {
  return Math.round(value / 1000) * 1000;
}
