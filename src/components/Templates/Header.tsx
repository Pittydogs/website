import Text from '@components/Text';
import settings from '@base/settings.json';
import { Button } from '@components/Button';

const Header: React.FC = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-[1rem] pt-[10px] lg:pt-[30px]">
      <Text
        as="h1"
        className="text-[13px] font-medium leading-[18px] text-neutral-11 lg:text-[16px] lg:leading-[22px]"
      >
        {settings.templatesPage.title}
      </Text>
      <Text className="text-[27px] font-bold leading-[32px] text-neutral-12 lg:text-[34px] lg:leading-[46px]">
        {settings.templatesPage.subTitle}
      </Text>
      <Text className="max-w-[640px] text-center text-[15px] font-normal leading-[20px] text-neutral-11 lg:text-[18px] lg:leading-[24px]">
        {settings.templatesPage.description}
      </Text>

      <Button
        size="sm"
        variant="app-primary"
        href={settings.templatesPage.ctaTargetUrl}
        className="mt-[1.25rem] h-26 text-[11px] lg:h-32 lg:text-[14px]"
      >
        {settings.templatesPage.ctaLabel}
      </Button>
    </div>
  );
};

export default Header;
