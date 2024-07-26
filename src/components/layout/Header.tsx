import React from 'react'
import { Flex, useColorModeValue, Spacer, Heading, Menu, MenuButton, MenuList, MenuItem, IconButton } from '@chakra-ui/react'
import { AddIcon, ExternalLinkIcon, RepeatIcon, EditIcon, HamburgerIcon, ArrowBackIcon, InfoIcon } from '@chakra-ui/icons'
import { FaEthereum, FaEuroSign, FaHome, FaFeather, FaVoteYea } from 'react-icons/fa'
import { LinkComponent } from './LinkComponent'
import { ThemeSwitcher } from './ThemeSwitcher'
import { SITE_NAME } from '../../utils/config'
import { GiReceiveMoney } from 'react-icons/gi'
import { IoExitOutline, IoEnterOutline } from 'react-icons/io5'
import { GrValidate } from 'react-icons/gr'
import { LuBookOpenCheck, LuKeyRound } from 'react-icons/lu'

interface Props {
  className?: string
}

export function Header(props: Props) {
  const className = props.className ?? ''

  return (
    <Flex as="header" className={className} bg={useColorModeValue('gray.100', 'gray.900')} px={4} py={5} mb={8} alignItems="center">
      <LinkComponent href="/">
        <Heading as="h1" size="md">
          {SITE_NAME}
        </Heading>
      </LinkComponent>
      <Spacer />

      <Flex alignItems="center" gap={4}>
        <Menu>
          <MenuButton as={IconButton} aria-label="Options" icon={<HamburgerIcon />} variant="outline" />
          <MenuList>
            <LinkComponent href="/">
              <MenuItem fontSize="xl" icon={<FaHome />}>
                Demander à Fatou
              </MenuItem>
            </LinkComponent>
            <LinkComponent href="/sources">
              <MenuItem fontSize="xl" icon={<LuBookOpenCheck />}>
                Sources
              </MenuItem>
            </LinkComponent>
            {/* <LinkComponent href="/colere">
              <MenuItem fontSize="xl">Colère</MenuItem>
            </LinkComponent> */}
            {/* <LinkComponent href="/mon-vote">
              <MenuItem fontSize="xl" icon={<FaVoteYea />}>
                Mon vote
              </MenuItem>
            </LinkComponent> */}
            <LinkComponent href="/gouv">
              <MenuItem fontSize="xl" icon={<LuKeyRound />}>
                Mon gouv
              </MenuItem>
            </LinkComponent>
          </MenuList>
        </Menu>
        {/* <w3m-button /> */}
        <ThemeSwitcher />
      </Flex>
    </Flex>
  )
}
