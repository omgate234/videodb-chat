<template>
  <div
    class="vdb-c-relative vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-16 vdb-c-py-14 vdb-c-text-left"
  >
    <LoadingMessage
      :status="content.status"
      :message="content.status_message"
      :is-last-conv="isLastConv"
    />
    <transition name="fade" mode="out-in">
      <div
        v-if="content.status === 'success' && content.video?.stream_url"
        :class="
          hasEditor
            ? 'vdb-c-w-fit vdb-c-rounded-20 vdb-c-bg-kilvish-200 vdb-c-outline vdb-c-outline-1 vdb-c-outline-[#E5E7EB]'
            : 'vdb-c-w-full vdb-c-py-6'
        "
      >
        <div
          :class="
            isFullScreen
              ? 'vdb-c-fixed vdb-c-inset-0 vdb-c-z-50 vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-overflow-y-hidden vdb-c-bg-black-64'
              : hasEditor
                ? 'vdb-c-flex vdb-c-w-full vdb-c-flex-col vdb-c-gap-16 vdb-c-p-16 lg:vdb-c-flex-row lg:vdb-c-items-center'
                : 'vdb-c-w-full vdb-c-overflow-hidden vdb-c-rounded-20 sm:vdb-c-w-3/4 lg:vdb-c-w-3/5 xl:vdb-c-w-1/2'
          "
        >
          <!-- LEFT: player -->
          <div
            :class="
              isFullScreen
                ? 'vdb-c-fixed vdb-c-inset-0 vdb-c-z-50 vdb-c-flex vdb-c-h-full vdb-c-w-full vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-overflow-y-hidden vdb-c-bg-black-64'
                : hasEditor
                  ? 'vdb-c-h-[170px] vdb-c-w-[300px] vdb-c-max-w-[300px] vdb-c-overflow-hidden vdb-c-rounded-20'
                  : 'vdb-c-w-full'
            "
          >
            <VideoDBPlayer
              :class="
                isFullScreen
                  ? 'vdb-c-h-screen vdb-c-w-screen'
                  : hasEditor
                    ? 'vdb-c-h-[170px] vdb-c-w-[300px] vdb-c-max-w-[300px]'
                    : 'vdb-c-w-full'
              "
              :stream-url="localStreamUrl"
              :default-controls="false"
              :default-overlay="false"
              :key="localStreamUrl"
              @fullScreenChange="handleFullScreenChange"
            >
              <template #overlay>
                <BigCenterButton
                  class="vdb-c-absolute vdb-c-left-1/2 vdb-c-top-1/2 vdb-c-h-48 vdb-c-w-48 vdb-c-translate-x-[-50%] vdb-c-translate-y-[-50%]"
                />
              </template>
              <template v-if="!hasEditor" #controls>
                <div class="vdb-c-p-20 vdb-c-pt-0">
                  <div class="vdb-c-mb-12">
                    <ProgressBar :stream-url="localStreamUrl" />
                  </div>
                  <div class="vdb-c-flex vdb-c-w-full vdb-c-justify-between">
                    <div
                      class="vdb-c-z-10 vdb-c-flex vdb-c-items-center vdb-c-gap-8"
                    >
                      <PlayPauseButton />
                      <VolumeControlButton />
                      <TimeCode />
                    </div>
                    <FullScreenButton />
                  </div>
                </div>
              </template>
            </VideoDBPlayer>
          </div>

          <!-- RIGHT: editor slider -->
          <div class="vdb-c-relative vdb-c-w-fit" v-if="hasEditor">
            <button
              @click="handleResetTrim"
              class="vdb-c-shadow-sm vdb-c-absolute -vdb-c-right-8 -vdb-c-top-8 vdb-c-z-10 vdb-c-flex vdb-c-h-24 vdb-c-w-24 vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[#F7F7F7] vdb-c-text-[#242424] hover:vdb-c-bg-pam hover:vdb-c-text-white"
              aria-label="Reset clip"
              title="Reset clip"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.84998 7.49998C1.84998 4.66458 4.05979 1.84998 7.49998 1.84998C10.2783 1.84998 11.6515 3.9064 12.2367 5H10.5C10.2239 5 10 5.22386 10 5.5C10 5.77614 10.2239 6 10.5 6H13.5C13.7761 6 14 5.77614 14 5.5V2.5C14 2.22386 13.7761 2 13.5 2C13.2239 2 13 2.22386 13 2.5V4.31318C12.2955 3.07126 10.6659 0.849976 7.49998 0.849976C3.43716 0.849976 0.849976 4.18537 0.849976 7.49998C0.849976 10.8146 3.43716 14.15 7.49998 14.15C9.44382 14.15 11.0622 13.3808 12.2145 12.2084C12.8315 11.5806 13.3133 10.839 13.6418 10.0407C13.7469 9.78536 13.6251 9.49315 13.3698 9.38806C13.1144 9.28296 12.8222 9.40478 12.7171 9.66014C12.4363 10.3425 12.0251 10.9745 11.5013 11.5074C10.5295 12.4963 9.16504 13.15 7.49998 13.15C4.05979 13.15 1.84998 10.3354 1.84998 7.49998Z"
                  fill="currentColor"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
            <VideoTrimmer
              :start="localStart"
              :end="localEnd"
              :minTime="minTime"
              :maxTime="maxTime"
              :thumbnails="content.video.thumbnail_data"
              :onStartChange="handleStartChange"
              :onEndChange="handleEndChange"
              :onMinTimeChange="handleMinTimeChange"
              :onMaxTimeChange="handleMaxTimeChange"
              :stream-url="content.video.stream_url"
              :video-length="content.video.length"
            />
          </div>
          <div
            v-if="hasEditor"
            class="vdb-c-relative vdb-c-flex vdb-c-flex-col vdb-c-items-center vdb-c-justify-center vdb-c-gap-8 vdb-c-rounded-full vdb-c-bg-white vdb-c-p-8 vdb-c-outline vdb-c-outline-[0.72px] vdb-c-outline-[rgba(36,36,36,0.20)]"
          >
            <div class="vdb-c-group vdb-c-relative">
              <button
                :class="[
                  'vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[#F7F7F7] vdb-c-p-[5px] vdb-c-text-[#242424] vdb-c-transition-colors vdb-c-duration-150 hover:vdb-c-bg-pam',
                  content.status === 'progress'
                    ? 'vdb-c-cursor-not-allowed vdb-c-opacity-50'
                    : '',
                ]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <g clip-path="url(#clip0_3955_15287)">
                    <path
                      class="vdb-c-fill-[#242424] vdb-c-transition-colors vdb-c-duration-150 group-hover:vdb-c-fill-white"
                      d="M11.014 1.75678L13.1071 3.8497C13.2224 3.96512 13.2814 4.11012 13.2842 4.2847C13.2869 4.45942 13.2278 4.60713 13.1071 4.72782C12.9863 4.84866 12.8399 4.90908 12.668 4.90908C12.496 4.90908 12.3496 4.84866 12.2288 4.72782L8.78339 1.28241C8.64338 1.14241 8.60533 0.98095 8.66922 0.798033C8.73297 0.615117 8.86345 0.506507 9.06068 0.472201C9.22304 0.449284 9.3797 0.434353 9.53068 0.427409C9.68179 0.420464 9.83866 0.416992 10.0013 0.416992C11.3228 0.416992 12.5646 0.666715 13.7265 1.16616C14.8883 1.6656 15.9054 2.35151 16.7778 3.22387C17.6501 4.09623 18.336 5.11331 18.8355 6.27512C19.3349 7.43706 19.5846 8.6788 19.5846 10.0003C19.5846 10.1774 19.5247 10.3258 19.4048 10.4455C19.285 10.5654 19.1365 10.6253 18.9594 10.6253C18.7822 10.6253 18.6338 10.5654 18.5142 10.4455C18.3945 10.3258 18.3346 10.1774 18.3346 10.0003C18.3346 8.95005 18.148 7.9522 17.7746 7.00678C17.4012 6.06123 16.8886 5.22199 16.2369 4.48908C15.5851 3.75616 14.8121 3.14956 13.918 2.66928C13.0237 2.18914 12.0557 1.88498 11.014 1.75678ZM8.98859 18.2439L6.89547 16.1509C6.78019 16.0355 6.72116 15.8905 6.71839 15.7159C6.71575 15.5412 6.77477 15.3935 6.89547 15.2728C7.0163 15.152 7.16269 15.0916 7.33463 15.0916C7.50658 15.0916 7.65297 15.152 7.7738 15.2728L11.2192 18.7182C11.3592 18.8582 11.3977 19.0214 11.3346 19.2078C11.2716 19.3942 11.1412 19.5003 10.9434 19.5259C10.7806 19.5516 10.6236 19.5677 10.4723 19.5741C10.3211 19.5805 10.1641 19.5837 10.0013 19.5837C8.68366 19.5837 7.44248 19.3341 6.27776 18.8349C5.11318 18.3357 4.09498 17.6503 3.22318 16.7784C2.35137 15.9066 1.66589 14.8884 1.16672 13.7239C0.667552 12.5591 0.417969 11.318 0.417969 10.0003C0.417969 9.82324 0.477899 9.67484 0.59776 9.55512C0.717622 9.43526 0.866094 9.37533 1.04318 9.37533C1.2204 9.37533 1.3688 9.43526 1.48839 9.55512C1.60811 9.67484 1.66797 9.82324 1.66797 10.0003C1.66797 11.0506 1.85464 12.0484 2.22797 12.9939C2.60144 13.9394 3.11401 14.7787 3.76568 15.5116C4.41748 16.2445 5.19047 16.8511 6.08464 17.3314C6.97894 17.8115 7.94693 18.1157 8.98859 18.2439ZM10.5109 15.7118L4.28651 9.4747C4.14651 9.33387 4.03839 9.1738 3.96214 8.99449C3.88575 8.81519 3.84755 8.62949 3.84755 8.43741C3.84755 8.24532 3.88575 8.05977 3.96214 7.88074C4.03839 7.70158 4.14651 7.54164 4.28651 7.40095L7.40193 4.28553C7.54276 4.14345 7.70283 4.03692 7.88213 3.96595C8.06144 3.89484 8.24713 3.85928 8.43922 3.85928C8.6313 3.85928 8.81686 3.89484 8.99588 3.96595C9.17505 4.03692 9.33498 4.14345 9.47568 4.28553L15.7001 10.5099C15.8401 10.6507 15.9482 10.8108 16.0246 10.9901C16.1009 11.1694 16.139 11.3551 16.139 11.5472C16.139 11.7393 16.1009 11.9248 16.0246 12.1039C15.9482 12.283 15.8401 12.443 15.7001 12.5837L12.5846 15.7118C12.4438 15.8539 12.2837 15.9605 12.1044 16.0316C11.9251 16.1025 11.7394 16.138 11.5473 16.138C11.3554 16.138 11.1698 16.1025 10.9907 16.0316C10.8115 15.9605 10.6516 15.8539 10.5109 15.7118ZM11.3634 14.808C11.4116 14.8561 11.473 14.8801 11.5478 14.8801C11.6226 14.8801 11.6841 14.8561 11.7321 14.808L14.809 11.7312C14.8571 11.6831 14.8811 11.6216 14.8811 11.5468C14.8811 11.4721 14.8571 11.4106 14.809 11.3624L8.62318 5.17658C8.57498 5.12852 8.51352 5.10449 8.4388 5.10449C8.36394 5.10449 8.30248 5.12852 8.25443 5.17658L5.17755 8.25345C5.1295 8.30151 5.10547 8.36296 5.10547 8.43783C5.10547 8.51255 5.1295 8.57401 5.17755 8.6222L11.3634 14.808ZM7.81068 8.43303C7.98151 8.43303 8.12332 8.37387 8.23609 8.25553C8.34873 8.13734 8.40505 7.99935 8.40505 7.84158C8.40505 7.67074 8.34873 7.52894 8.23609 7.41616C8.12345 7.30352 7.98102 7.2472 7.8088 7.2472C7.64977 7.2472 7.51172 7.30352 7.39464 7.41616C7.27769 7.5288 7.21922 7.67123 7.21922 7.84345C7.21922 8.00248 7.27839 8.14053 7.39672 8.25762C7.51505 8.37456 7.65304 8.43303 7.81068 8.43303Z"
                      fill="#242424"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_3955_15287">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </button>
              <div
                class="vdb-c-absolute vdb-c-right-full vdb-c-top-1/2 vdb-c-z-[10000] vdb-c-mr-10 vdb-c-hidden vdb-c--translate-y-1/2 vdb-c-items-center vdb-c-justify-end vdb-c-gap-10 vdb-c-whitespace-nowrap vdb-c-rounded-full vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-[14px] vdb-c-text-black group-hover:vdb-c-inline"
                style="
                  box-shadow:
                    0 55px 16px 0 rgba(0, 0, 0, 0),
                    0 36px 14px 0 rgba(0, 0, 0, 0.01),
                    0 20px 12px 0 rgba(0, 0, 0, 0.04),
                    0 9px 9px 0 rgba(0, 0, 0, 0.07),
                    0 2px 5px 0 rgba(0, 0, 0, 0.08);
                "
              >
                Convert to Vertical
              </div>
            </div>
            <div class="vdb-c-group vdb-c-relative">
              <button
                class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[#F7F7F7] vdb-c-p-[5px] vdb-c-text-[#242424] vdb-c-transition-colors vdb-c-duration-150 hover:vdb-c-bg-pam"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    class="vdb-c-fill-[#242424] vdb-c-transition-colors vdb-c-duration-150 group-hover:vdb-c-fill-white"
                    d="M10 12.8429C9.89958 12.8429 9.80611 12.8269 9.71958 12.7948C9.63306 12.7628 9.55076 12.7078 9.47271 12.6298L6.88146 10.0385C6.75757 9.91451 6.69639 9.76944 6.69792 9.60333C6.69958 9.43722 6.76076 9.28951 6.88146 9.16021C7.01076 9.03104 7.15924 8.96431 7.32688 8.96C7.49465 8.9557 7.64319 9.0182 7.7725 9.1475L9.375 10.75V4.375C9.375 4.19764 9.43486 4.04917 9.55458 3.92958C9.67417 3.80986 9.82264 3.75 10 3.75C10.1774 3.75 10.3258 3.80986 10.4454 3.92958C10.5651 4.04917 10.625 4.19764 10.625 4.375V10.75L12.2275 9.1475C12.3515 9.02361 12.4987 8.96243 12.669 8.96396C12.8394 8.96563 12.9892 9.03104 13.1185 9.16021C13.2392 9.28951 13.3017 9.4359 13.306 9.59937C13.3103 9.76285 13.2478 9.90924 13.1185 10.0385L10.5273 12.6298C10.4492 12.7078 10.3669 12.7628 10.2804 12.7948C10.1939 12.8269 10.1004 12.8429 10 12.8429ZM5.25646 16.25C4.83549 16.25 4.47917 16.1042 4.1875 15.8125C3.89583 15.5208 3.75 15.1645 3.75 14.7435V13.109C3.75 12.9316 3.80986 12.7831 3.92958 12.6635C4.04917 12.5438 4.19764 12.484 4.375 12.484C4.55236 12.484 4.70083 12.5438 4.82042 12.6635C4.94014 12.7831 5 12.9316 5 13.109V14.7435C5 14.8077 5.02674 14.8665 5.08021 14.9198C5.13354 14.9733 5.19229 15 5.25646 15H14.7435C14.8077 15 14.8665 14.9733 14.9198 14.9198C14.9733 14.8665 15 14.8077 15 14.7435V13.109C15 12.9316 15.0599 12.7831 15.1796 12.6635C15.2992 12.5438 15.4476 12.484 15.625 12.484C15.8024 12.484 15.9508 12.5438 16.0704 12.6635C16.1901 12.7831 16.25 12.9316 16.25 13.109V14.7435C16.25 15.1645 16.1042 15.5208 15.8125 15.8125C15.5208 16.1042 15.1645 16.25 14.7435 16.25H5.25646Z"
                    fill="#242424"
                  />
                </svg>
              </button>
              <div
                class="vdb-c-absolute vdb-c-right-full vdb-c-top-1/2 vdb-c-z-[10000] vdb-c-mr-10 vdb-c-hidden vdb-c--translate-y-1/2 vdb-c-items-center vdb-c-justify-end vdb-c-gap-10 vdb-c-whitespace-nowrap vdb-c-rounded-full vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-[14px] vdb-c-text-black group-hover:vdb-c-inline"
                style="
                  box-shadow:
                    0 55px 16px 0 rgba(0, 0, 0, 0),
                    0 36px 14px 0 rgba(0, 0, 0, 0.01),
                    0 20px 12px 0 rgba(0, 0, 0, 0.04),
                    0 9px 9px 0 rgba(0, 0, 0, 0.07),
                    0 2px 5px 0 rgba(0, 0, 0, 0.08);
                "
              >
                Download
              </div>
            </div>
            <div class="vdb-c-group vdb-c-relative">
              <button
                :disabled="content.status === 'progress'"
                @click="handleFindSimilar"
                :class="[
                  'vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[#F7F7F7] vdb-c-p-[5px] vdb-c-text-[#242424] vdb-c-transition-colors vdb-c-duration-150 hover:vdb-c-bg-pam',
                  content.status === 'progress'
                    ? 'vdb-c-cursor-not-allowed vdb-c-opacity-50'
                    : '',
                ]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    class="vdb-c-fill-[#242424] vdb-c-transition-colors vdb-c-duration-150 group-hover:vdb-c-fill-white"
                    d="M14.0846 8.80572C14.263 8.69141 14.3521 8.53384 14.3521 8.33301C14.3521 8.13217 14.263 7.97461 14.0846 7.8603L10.4548 5.52863C10.2679 5.40044 10.0761 5.39002 9.87943 5.49738C9.6829 5.60474 9.58464 5.77273 9.58464 6.00134V10.6647C9.58464 10.8933 9.6829 11.0613 9.87943 11.1686C10.0761 11.276 10.2679 11.2656 10.4548 11.1374L14.0846 8.80572ZM6.71609 14.583C6.29512 14.583 5.9388 14.4372 5.64714 14.1455C5.35547 13.8538 5.20964 13.4975 5.20964 13.0765V3.58947C5.20964 3.16849 5.35547 2.81217 5.64714 2.52051C5.9388 2.22884 6.29512 2.08301 6.71609 2.08301H16.2032C16.6241 2.08301 16.9805 2.22884 17.2721 2.52051C17.5638 2.81217 17.7096 3.16849 17.7096 3.58947V13.0765C17.7096 13.4975 17.5638 13.8538 17.2721 14.1455C16.9805 14.4372 16.6241 14.583 16.2032 14.583H6.71609ZM6.71609 13.333H16.2032C16.2673 13.333 16.3261 13.3063 16.3794 13.2528C16.4329 13.1995 16.4596 13.1407 16.4596 13.0765V3.58947C16.4596 3.5253 16.4329 3.46655 16.3794 3.41322C16.3261 3.35974 16.2673 3.33301 16.2032 3.33301H6.71609C6.65193 3.33301 6.59318 3.35974 6.53984 3.41322C6.48637 3.46655 6.45964 3.5253 6.45964 3.58947V13.0765C6.45964 13.1407 6.48637 13.1995 6.53984 13.2528C6.59318 13.3063 6.65193 13.333 6.71609 13.333ZM3.79943 17.4997C3.37845 17.4997 3.02214 17.3538 2.73047 17.0622C2.4388 16.7705 2.29297 16.4142 2.29297 15.9932V5.88113C2.29297 5.70377 2.35283 5.55523 2.47255 5.43551C2.59214 5.31592 2.74061 5.25613 2.91797 5.25613C3.09533 5.25613 3.24387 5.31592 3.36359 5.43551C3.48318 5.55523 3.54297 5.70377 3.54297 5.88113V15.9932C3.54297 16.0574 3.56971 16.1161 3.62318 16.1695C3.67651 16.2229 3.73526 16.2497 3.79943 16.2497H13.9115C14.0889 16.2497 14.2374 16.3095 14.3571 16.429C14.4767 16.5488 14.5365 16.6973 14.5365 16.8747C14.5365 17.052 14.4767 17.2005 14.3571 17.3201C14.2374 17.4398 14.0889 17.4997 13.9115 17.4997H3.79943Z"
                    fill="#242424"
                  />
                </svg>
              </button>
              <div
                class="vdb-c-absolute vdb-c-right-full vdb-c-top-1/2 vdb-c-z-[10000] vdb-c-mr-10 vdb-c-hidden vdb-c--translate-y-1/2 vdb-c-items-center vdb-c-justify-end vdb-c-gap-10 vdb-c-whitespace-nowrap vdb-c-rounded-full vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-[14px] vdb-c-text-black group-hover:vdb-c-inline"
                style="
                  box-shadow:
                    0 55px 16px 0 rgba(0, 0, 0, 0),
                    0 36px 14px 0 rgba(0, 0, 0, 0.01),
                    0 20px 12px 0 rgba(0, 0, 0, 0.04),
                    0 9px 9px 0 rgba(0, 0, 0, 0.07),
                    0 2px 5px 0 rgba(0, 0, 0, 0.08);
                "
              >
                Find Similar Content
              </div>
            </div>
            <div class="vdb-c-group vdb-c-relative">
              <button
                class="vdb-c-flex vdb-c-items-center vdb-c-justify-center vdb-c-rounded-full vdb-c-bg-[#F7F7F7] vdb-c-p-[5px] vdb-c-text-[#242424] vdb-c-transition-colors vdb-c-duration-150 hover:vdb-c-bg-pam"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    class="vdb-c-fill-[#242424] vdb-c-transition-colors vdb-c-duration-150 group-hover:vdb-c-fill-white"
                    d="M4.16602 15.8337H5.21727L13.7477 7.30324L12.6964 6.25199L4.16602 14.7824V15.8337ZM3.66935 17.0837C3.45588 17.0837 3.27699 17.0114 3.13268 16.867C2.98824 16.7227 2.91602 16.5438 2.91602 16.3303V14.8866C2.91602 14.6834 2.95504 14.4897 3.0331 14.3055C3.11102 14.1214 3.21838 13.9609 3.35518 13.8241L13.9081 3.27595C14.0341 3.16151 14.1732 3.0731 14.3254 3.01074C14.4778 2.94824 14.6375 2.91699 14.8046 2.91699C14.9716 2.91699 15.1334 2.94665 15.29 3.00595C15.4466 3.06526 15.5853 3.15956 15.706 3.28887L16.7237 4.31928C16.853 4.43998 16.9452 4.57887 17.0002 4.73595C17.0552 4.89303 17.0827 5.05012 17.0827 5.2072C17.0827 5.37484 17.0541 5.53477 16.9968 5.68699C16.9396 5.83935 16.8486 5.97852 16.7237 6.10449L6.1756 16.6445C6.03879 16.7813 5.87831 16.8887 5.69414 16.9666C5.50997 17.0446 5.31629 17.0837 5.1131 17.0837H3.66935ZM13.2129 6.78678L12.6964 6.25199L13.7477 7.30324L13.2129 6.78678Z"
                    fill="#242424"
                  />
                </svg>
              </button>
              <div
                class="vdb-c-absolute vdb-c-right-full vdb-c-top-1/2 vdb-c-z-[10000] vdb-c-mr-10 vdb-c-hidden vdb-c--translate-y-1/2 vdb-c-items-center vdb-c-justify-end vdb-c-gap-10 vdb-c-whitespace-nowrap vdb-c-rounded-full vdb-c-border vdb-c-border-roy vdb-c-bg-white vdb-c-px-12 vdb-c-py-8 vdb-c-text-[14px] vdb-c-text-black group-hover:vdb-c-inline"
                style="
                  box-shadow:
                    0 55px 16px 0 rgba(0, 0, 0, 0),
                    0 36px 14px 0 rgba(0, 0, 0, 0.01),
                    0 20px 12px 0 rgba(0, 0, 0, 0.04),
                    0 9px 9px 0 rgba(0, 0, 0, 0.07),
                    0 2px 5px 0 rgba(0, 0, 0, 0.08);
                "
              >
                Edit Meta Information
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="content.status === 'progress'">
        <div
          class="vdb-c-animate-pulse vdb-c-overflow-hidden vdb-c-rounded-20"
          style="width: 640px; max-width: 100%"
        >
          <div class="vdb-c-relative vdb-c-w-full" style="padding-top: 56.25%">
            <div class="vdb-c-absolute vdb-c-inset-0 vdb-c-bg-gray-200"></div>
          </div>
        </div>
      </div>

      <div
        v-else-if="content.status === 'not_generated'"
        class="vdb-c-flex vdb-c-flex-col"
      ></div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useVideoDBChat } from "../../context.js";
import {
  VideoDBPlayer,
  TimeCode,
  BigCenterButton,
  VolumeControlButton,
  PlayPauseButton,
  FullScreenButton,
  ProgressBar,
} from "@videodb/player-vue";
import "@videodb/player-vue/dist/style.css";
import LoadingMessage from "./elements/LoadingMessage.vue";
import VideoTrimmer from "./elements/VideoTrimmer.vue";

const props = defineProps({
  content: { type: Object, required: true },
  isLastConv: { type: Boolean, default: false },
});

// Removed logging watchers

const isFullScreen = ref(false);
const handleFullScreenChange = async () => {
  try {
    isFullScreen.value = !isFullScreen.value;
    if (isFullScreen.value) {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  } catch {}
};

const hasEditor = computed(() => {
  const v = props.content?.video ?? {};
  return (
    v &&
    typeof v.start === "number" &&
    typeof v.end === "number" &&
    Array.isArray(v.thumbnail_data) &&
    v.thumbnail_data.length > 0
  );
});

// trim range (draggable handles)
const minTime = ref(props.content?.video?.start ?? 0);
const maxTime = ref(props.content?.video?.end ?? 0);
const localStart = ref(minTime.value);
const localEnd = ref(maxTime.value);
const localStreamUrl = ref(props.content?.video?.stream_url || "");

// callbacks consumed by VideoTrimmer
const handleStartChange = (start) => {
  localStart.value = start;
};
const handleEndChange = (end) => {
  localEnd.value = end;
};
const handleMinTimeChange = (newMinTime) => {
  minTime.value = newMinTime;
};
const handleMaxTimeChange = (newMaxTime) => {
  maxTime.value = newMaxTime;
};

// Removed logging watcher that observed trimmer payload

watch(
  () => ({
    id: props.content?.video?.id,
    stream: props.content?.video?.stream_url,
    start: props.content?.video?.start,
    end: props.content?.video?.end,
  }),
  ({ start, end }) => {
    if (typeof start === "number" && typeof end === "number") {
      minTime.value = start;
      maxTime.value = end;
      localStart.value = start;
      localEnd.value = end;
    }
    localStreamUrl.value = props.content?.video?.stream_url || "";
  },
  { immediate: true },
);
// API from context and Send "Find Similar Content" message
const { addMessage, generateVideoStream, activeCollectionData } =
  useVideoDBChat();

// Debounced refresh of stream URL when trimmed range changes
let debounceTimer = null;
watch(
  () => [localStart.value, localEnd.value],
  async ([start, end]) => {
    if (!hasEditor.value) return;
    const video = props.content?.video;
    const collectionId = activeCollectionData?.value?.id;
    if (!video?.id || !collectionId) return;
    if (typeof start !== "number" || typeof end !== "number") return;
    if (start >= end) return;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const res = await generateVideoStream(collectionId, video.id, start, end);
      if (res?.status === "success" && res?.data?.stream_url) {
        localStreamUrl.value = res.data.stream_url;
      }
    }, 400);
  },
);
// Reset trim and stream url to original values
const handleResetTrim = () => {
  const v = props.content?.video || {};
  if (typeof v.start === "number" && typeof v.end === "number") {
    minTime.value = v.start;
    maxTime.value = v.end;
    localStart.value = v.start;
    localEnd.value = v.end;
  }
  if (v.stream_url) {
    localStreamUrl.value = v.stream_url;
  }
};
const handleFindSimilar = () => {
  if (props.content?.status === "progress") return;
  const video = props.content?.video || {};
  const name = video?.name || "this";
  addMessage?.({
    content: [
      {
        type: "text",
        text: `@DeepSearch find me similar content like the one from ${name}`,
      },
    ],
    additional_data: {
      ui_event: "more_like",
      join_data: {
        video_id: video?.id ?? null,
        start: video?.start ?? null,
        end: video?.end ?? null,
        text: video?.text ?? null,
      },
    },
  });
};
</script>

<style lang="scss">
.video-js .vjs-big-play-button {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
